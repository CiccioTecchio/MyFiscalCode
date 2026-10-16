import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-slate-900/90 px-4 py-3 text-sm text-slate-300">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-3">
        <Link href="/">My Fiscal Code</Link>

        <nav aria-label="Link informativi" className="flex gap-4">
          <Link className="hover:text-white hover:underline" href="/about">
            About
          </Link>
          <Link className="hover:text-white hover:underline" href="/privacy">
            Privacy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
