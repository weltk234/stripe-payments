import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-32 text-center">
      <p className="text-[16px] font-semibold text-ink-strong">No such payment</p>
      <p className="text-[14px] text-subdued">The payment you’re looking for doesn’t exist or was removed.</p>
      <Link href="/payments" className="mt-2 text-[14px] font-medium text-brand-text hover:text-brand-hover">
        Back to payments
      </Link>
    </div>
  );
}
