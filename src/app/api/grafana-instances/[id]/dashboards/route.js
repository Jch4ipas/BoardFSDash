import { getInstanceById } from "@/lib/grafana-instances";

export async function GET(_, { params }) {
  const { id } = await params;
  const instance = await getInstanceById(id);
  if (!instance) return Response.json({ error: "Instance introuvable" }, { status: 404 });

  let res;
  try {
    res = await fetch(`${instance.url}/api/search?type=dash-db&limit=1000`, {
      headers: { Authorization: `Bearer ${instance.token}` },
    });
  } catch (e) {
    return Response.json({ error: `Impossible de joindre Grafana : ${e.message}` }, { status: 502 });
  }

  if (!res.ok) {
    return Response.json({ error: `Grafana a répondu ${res.status}` }, { status: res.status });
  }

  const items = await res.json();
  return Response.json(items.map((d) => ({ uid: d.uid, title: d.title, url: d.url })));
}
