import { ingest } from "@/lib/ingestion";
import { prismaReadingStore } from "@/lib/prisma-reading-store";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return Response.json({ error: "Database not configured. Retain pending records." }, { status: 503 });
  }
  return ingest(request, prismaReadingStore);
}
