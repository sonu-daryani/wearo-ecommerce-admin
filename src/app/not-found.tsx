import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Not found</h1>
      <Link href="/admin" className="text-primary font-medium hover:underline">
        Back to admin
      </Link>
    </div>
  );
}
