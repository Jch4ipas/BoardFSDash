import { deleteInstance } from "@/lib/grafana-instances";

export async function DELETE(_, { params }) {
  const { id } = await params;
  await deleteInstance(id);
  return new Response(null, { status: 204 });
}
