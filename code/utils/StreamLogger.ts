import { Writable } from "stream";

export class StreamLogger extends Writable {
  constructor() {
    super({ decodeStrings: false, objectMode: true });
  }

  _write(
    chunk: any,
    encoding: BufferEncoding,
    callback: (error?: Error | null | undefined) => void
  ): void {
    console.log(chunk);
    callback();
  }

  _writev(
    chunks: { chunk: any; encoding: BufferEncoding }[],
    callback: (error?: Error | null | undefined) => void
  ): void {
    console.log(chunks);
    callback();
  }

  _final(callback: (error?: Error | null | undefined) => void): void {
    console.log("LOGGER FINAL CALLED");
    callback();
  }
}
