import { Worker } from "worker_threads";
import path from "path";
import { fileURLToPath } from "url";

export class WorkerManager {
  private workers = new Map<string, Worker>();

  start(workerName: string, workerFileName: string) {
    if (this.workers.has(workerName)) {
      console.log(`[WorkerManager] Worker "${workerName}" already running`);
      return;
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const workerPath = path.join(__dirname, `../workers/${workerFileName}.js`);

    const worker = new Worker(workerPath);

    worker.on("message", (msg) => console.log(`[WorkerManager] ${workerName}:`, msg));
    worker.on("error", (err) => {
      console.error(`[WorkerManager] ${workerName} error:`, err);
      this.workers.delete(workerName);
    });
    worker.on("exit", (code) => {
      console.log(`[WorkerManager] ${workerName} exited with code ${code}`);
      this.workers.delete(workerName);
    });

    this.workers.set(workerName, worker);
    console.log(`[WorkerManager] Worker "${workerName}" started`);
  }

  async stop(workerName: string) {
    const worker = this.workers.get(workerName);
    if (!worker) return;

    return new Promise<number>((resolve, reject) => {
      worker.postMessage("stop");
      const timeout = setTimeout(() => {
        worker.terminate();
        reject(new Error(`Worker "${workerName}" termination timeout`));
      }, 5000);

      worker.once("exit", (code) => {
        clearTimeout(timeout);
        this.workers.delete(workerName);
        resolve(code);
      });
    });
  }

  async stopAll() {
    await Promise.allSettled([...this.workers.keys()].map((name) => this.stop(name)));
    this.workers.clear();
    console.log("[WorkerManager] All workers stopped");
  }
}
