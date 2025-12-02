import { addSocket } from "@/lib/realtime/broadcast";

export const runtime = "edge";

export async function GET(request: Request) {
  const upgradeHeader = request.headers.get("upgrade") || "";
  if (upgradeHeader.toLowerCase() !== "websocket") {
    return new Response("Expected WebSocket", { status: 400 });
  }

  const { 0: client, 1: server } = new WebSocketPair();

  (server as WebSocket).accept();
  addSocket(server as WebSocket);

  return new Response(null, {
    status: 101,
    webSocket: client
  } as any);
}


