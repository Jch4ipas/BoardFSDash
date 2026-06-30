let clients = [];

export async function GET(request) {
  const stream = new ReadableStream({
    start(controller) {
      clients.push(controller);
      request.signal.addEventListener("abort", () => {
        clients = clients.filter(c => c !== controller);
      });
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export function notifyClients() {
  clients.forEach(controller => {
    controller.enqueue(new TextEncoder().encode("data: update\n\n"));
  });
}