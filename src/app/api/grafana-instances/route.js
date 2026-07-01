import { getInstances, addInstance } from "@/lib/grafana-instances";

export async function GET() {
  const instances = await getInstances();
  return Response.json(instances.map(({ id, name, url }) => ({ id, name, url })));
}

export async function POST(request) {
  const { name, url, token } = await request.json();
  if (!name?.trim() || !url?.trim() || !token?.trim()) {
    return Response.json({ error: "Nom, URL et token sont requis" }, { status: 400 });
  }
  if (!/^https?:\/\/.+/.test(url.trim())) {
    return Response.json({ error: "L'URL doit commencer par http:// ou https://" }, { status: 400 });
  }
  if (token.trim().length < 10) {
    return Response.json({ error: "Le token semble invalide (trop court)" }, { status: 400 });
  }
  const instance = await addInstance({ name: name.trim(), url: url.trim(), token: token.trim() });
  return Response.json({ id: instance.id, name: instance.name, url: instance.url }, { status: 201 });
}
