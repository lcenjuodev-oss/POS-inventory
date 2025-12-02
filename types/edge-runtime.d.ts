// Type definitions for Edge Runtime (Cloudflare Workers) WebSocket API

declare global {
  class WebSocketPair {
    0: WebSocket; // client
    1: WebSocket; // server
  }

  interface WebSocket {
    accept(): void;
  }
}

export {};

