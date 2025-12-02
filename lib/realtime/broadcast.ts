// Server-side utility for broadcasting realtime events
// Note: In Edge runtime, this uses in-memory storage which is per-instance
// For production, consider using a shared store (Redis, etc.)

const sockets = new Set<WebSocket>();

export function addSocket(socket: WebSocket) {
  sockets.add(socket);
  
  socket.addEventListener("close", () => {
    sockets.delete(socket);
  });
  
  socket.addEventListener("error", () => {
    sockets.delete(socket);
  });
}

export function broadcastRealtimeEvent(payload: unknown) {
  for (const socket of sockets) {
    try {
      socket.send(JSON.stringify(payload));
    } catch {
      // ignore errors (socket might be closed)
    }
  }
}

