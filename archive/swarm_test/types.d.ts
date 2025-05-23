declare module 'gif-encoder-2' {
  class GifEncoder {
    constructor(width: number, height: number);
    setDelay(ms: number): void;
    start(): void;
    addFrame(context: CanvasRenderingContext2D): void;
    finish(): void;
    out: {
      getData(): Buffer;
    };
  }
  export = GifEncoder;
} 