import { auth } from "@/auth";
import { can } from "@/lib/rbac";
import { isR2Configured, uploadBufferToR2 } from "@/lib/r2";
import { NextResponse } from "next/server";
import type { Role } from "@prisma/client";
import { randomBytes } from "crypto";

export const runtime = "nodejs";

const ALLOWED = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(req: Request) {
  const session = await auth();
  const role = session?.user?.role as Role | undefined;
  const canUpload =
    can(role, "product:write") || can(role, "cms:write");
  if (!session?.user?.id || !canUpload) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!isR2Configured()) {
    return NextResponse.json(
      { error: "R2 is not configured. Set R2_* environment variables." },
      { status: 503 }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const prefixRaw = String(formData.get("prefix") ?? "products").toLowerCase();
  const folder = prefixRaw === "site" ? "site" : "products";
  if (folder === "site" && !can(role, "cms:write")) {
    return NextResponse.json(
      { error: "CMS write permission required for site uploads." },
      { status: 403 }
    );
  }
  if (folder === "products" && !can(role, "product:write")) {
    return NextResponse.json(
      { error: "Product write permission required for catalog uploads." },
      { status: 403 }
    );
  }

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only JPEG, PNG, WebP, GIF, or SVG images are allowed." },
      { status: 400 }
    );
  }

  const buf = Buffer.from(await file.arrayBuffer());
  if (buf.length > MAX_BYTES) {
    return NextResponse.json({ error: "File too large (max 8MB)." }, { status: 400 });
  }

  const ext =
    file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const safeExt = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)
    ? ext === "jpg"
      ? "jpg"
      : ext
    : "bin";

  const key = `${folder}/${Date.now()}-${randomBytes(6).toString("hex")}.${safeExt}`;

  try {
    const url = await uploadBufferToR2(buf, file.type, key);
    return NextResponse.json({ url, key });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
