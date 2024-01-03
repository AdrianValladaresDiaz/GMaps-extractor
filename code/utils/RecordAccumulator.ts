import { Duplex, Transform, TransformCallback, Writable } from "stream";

/**Wrapper around an array of <size>
 * Filter out null and undefined.
 * When the array is full, will start inserting at the beginning of the array
 * again. So make sure to call flush whenever this is full to prevent repeat
 * returns.
 */
class Memory {
  isFull = false;

  private memory: any[];
  private maxIndex: number;
  private insertIndex = 0;
  private size: number;

  constructor(size: number) {
    this.maxIndex = size - 1;
    this.size = size;
    this.resetMemory();
  }

  private resetMemory() {
    this.memory = new Array(this.size);
    this.isFull = false;
  }

  push(item: any) {
    if (item === undefined || item === null) {
      return;
    }
    this.memory[this.insertIndex] = item;
    this.insertIndex += 1;
    if (this.insertIndex > this.maxIndex) {
      this.insertIndex = 0;
      this.isFull = true;
    }
  }

  /**Returns internal memory and refreshes it. Culls nulls */
  flush() {
    const memCopy = this.isFull
      ? [...this.memory]
      : this.memory.slice(0, this.insertIndex);
    this.resetMemory();
    return memCopy;
  }
}

export class RecordAccumulator extends Transform {
  private memory: Memory;
  constructor(batchSize: number) {
    super({ objectMode: true });
    this.memory = new Memory(batchSize);
  }

  _transform(chunk: any, _: any, callback: TransformCallback): void {
    this.memory.push(chunk);
    if (this.memory.isFull) {
      this.push(this.memory.flush());
    }
    callback();
  }

  _flush(callback: TransformCallback): void {
    this.push(this.memory.flush());
    callback();
  }
}
