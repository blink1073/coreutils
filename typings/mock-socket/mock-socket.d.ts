// Type definitions for mock-socket v6.0.4
// Project: https://github.com/thoov/mock-socket
// Definitions by: Steven Silvester <https://github.com/blink1073>

declare module "mock-socket" {
  export class Server {
    constructor(url: string, options?: any);
    start(): void;
    stop(callback?: () => void): void;
    on(type: string, callback: any): void;
    send(data: string, options?: any): void;
    close(options?: any): void;
  }
}
