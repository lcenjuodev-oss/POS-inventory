export const runtime = "edge";

// Very small in-memory hub for WebSocket connections (template only)
const sockets = new Set<WebSocket>();

export async function GET(request: Request) {
  const upgradeHeader = request.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  const { 0: client, 1: server } = new WebSocketPair();

  (server as WebSocket).accept();

  sockets.add(server as WebSocket);

  (server as WebSocket).addEventListener("close", () => {
    sockets.delete(server as WebSocket);
  });

  (server as WebSocket).addEventListener("error", () => {
    sockets.delete(server as WebSocket);
  });

  return new Response(null, {
    status: 101,
    webSocket: client
  } as any);
}

export function broadcastRealtimeEvent(payload: unknown) {
  for (const socket of sockets) {
    try {
      socket.send(JSON.stringify(payload));
    } catch {
      // ignore
    }
  }
}


