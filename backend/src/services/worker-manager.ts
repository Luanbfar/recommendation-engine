import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";

export class WorkerManager {
  private workers = new Map<string, Worker>();
  private isShuttingDown = false;

  constructor(private maxRestartAttempts: number = 3) {}

  start(workerName: string, workerFileName: string, data?: any) {
    if (this.isShuttingDown) {
      console.log(`[WorkerManager] Ignoring start, shutdown in progress`);
      return;
    }

    if (this.workers.has(workerName)) {
      console.log(`[WorkerManager] Worker "${workerName}" already running`);
      return;
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const workerPath = path.join(__dirname, `../workers/${workerFileName}.js`);

    const restartAttempts = new Map<string, number>();

    const startWorker = () => {
      const worker = new Worker(workerPath, {
        workerData: data,
      });

      worker.on("message", (msg) => {
        console.log(`[WorkerManager] ${workerName}:`, msg);

        if (msg.type === "health") {
          console.log(`[WorkerManager] ${workerName} health:`, msg.data);
        }
      });

      worker.on("error", (err) => {
        console.error(`[WorkerManager] ${workerName} error:`, err);

        const attempts = restartAttempts.get(workerName) || 0;
        if (attempts < this.maxRestartAttempts) {
          console.log(
            `[WorkerManager] Restarting ${workerName} (attempt ${attempts + 1})`
          );
          restartAttempts.set(workerName, attempts + 1);
          setTimeout(() => startWorker(), 5000);
        } else {
          console.error(
            `[WorkerManager] Max restart attempts reached for ${workerName}`
          );
        }

        this.workers.delete(workerName);
      });

      worker.on("exit", (code) => {
        console.log(`[WorkerManager] ${workerName} exited with code ${code}`);
        this.workers.delete(workerName);

        if (code !== 0 && !this.isShuttingDown) {
          const attempts = restartAttempts.get(workerName) || 0;
          if (attempts < this.maxRestartAttempts) {
            console.log(`[WorkerManager] Restarting ${workerName} after exit`);
            restartAttempts.set(workerName, attempts + 1);
            setTimeout(() => startWorker(), 2000);
          }
        }
      });

      this.workers.set(workerName, worker);
      console.log(
        `[WorkerManager] Worker "${workerName}" started successfully`
      );
    };

    startWorker();
  }

  async stop(workerName: string, timeoutMs: number = 10000): Promise<number> {
    const worker = this.workers.get(workerName);
    if (!worker) {
      console.log(`[WorkerManager] Worker "${workerName}" not found`);
      return 0;
    }

    return new Promise<number>((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn(
          `[WorkerManager] Force terminating worker "${workerName}"`
        );
        worker.terminate();
        reject(new Error(`Worker "${workerName}" termination timeout`));
      }, timeoutMs);

      worker.postMessage({ type: "shutdown" });

      worker.once("exit", (code) => {
        clearTimeout(timeout);
        this.workers.delete(workerName);
        console.log(
          `[WorkerManager] Worker "${workerName}" stopped gracefully`
        );
        resolve(code);
      });
    });
  }

  async stopAll(): Promise<void> {
    this.isShuttingDown = true;

    const stopPromises = Array.from(this.workers.keys()).map((name) =>
      this.stop(name).catch((err) => {
        console.error(`[WorkerManager] Error stopping worker ${name}:`, err);
        return -1;
      })
    );

    await Promise.allSettled(stopPromises);
    this.workers.clear();
    console.log("[WorkerManager] All workers stopped");
  }

  getWorkerStatus(workerName: string): { running: boolean } {
    return {
      running: this.workers.has(workerName),
    };
  }

  getAllWorkersStatus(): Record<string, { running: boolean }> {
    const status: Record<string, { running: boolean }> = {};
    for (const [name] of this.workers) {
      status[name] = this.getWorkerStatus(name);
    }
    return status;
  }
}
