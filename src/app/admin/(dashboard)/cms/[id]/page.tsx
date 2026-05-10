import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { auth } from "@/auth";
import { canEditCms } from "@/lib/rbac";
import type { Role } from "@prisma/client";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function CmsViewPage({ params }: { params: { id: string } }) {
  const session = await auth();
  const role = session?.user?.role as Role;
  const canEdit = canEditCms(role);

  const doc = await prisma.cmsDocument.findUnique({
    where: { id: params.id },
    include: { author: { select: { email: true, name: true } } },
  });

  if (!doc) notFound();

  return (
    <div>
      <div className="mb-6">
        <Link href="/admin/cms" className="text-sm text-primary font-medium hover:underline">
          ← All documents
        </Link>
      </div>
      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{doc.title}</h1>
          <p className="text-sm text-slate-500 mt-1 font-mono">{doc.slug}</p>
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <Link
              href={`/admin/cms/${doc.id}/edit`}
              className="rounded-full bg-slate-900 text-white px-4 py-2 text-sm font-medium hover:bg-slate-800"
            >
              Edit
            </Link>
          </div>
        )}
      </div>

      <dl className="grid grid-cols-2 gap-3 text-sm mb-8 max-w-lg">
        <dt className="text-slate-500">Type</dt>
        <dd className="font-medium">{doc.type}</dd>
        <dt className="text-slate-500">Status</dt>
        <dd className="font-medium">{doc.published ? "Published" : "Draft"}</dd>
        <dt className="text-slate-500">Author</dt>
        <dd className="font-medium">{doc.author.email ?? doc.author.name ?? "—"}</dd>
        <dt className="text-slate-500">Updated</dt>
        <dd className="font-medium">{doc.updatedAt.toLocaleString("en-IN")}</dd>
      </dl>

      {doc.summary && (
        <p className="text-slate-700 border-l-4 border-primary pl-4 mb-6">{doc.summary}</p>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Content
        </h2>
        <div
          className="cms-html-preview max-w-none text-sm leading-relaxed text-slate-800 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-slate-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-slate-100 [&_code]:px-1 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:text-base [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:my-2 [&_p]:my-2 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-slate-900 [&_pre]:p-3 [&_pre]:text-slate-100 [&_ul]:my-2"
          dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(doc.content) }}
        />
      </div>
    </div>
  );
}
