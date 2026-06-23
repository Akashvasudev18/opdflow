"use client";

import Link from "next/link";

export default function NavBar() {
  return (
    <header className="border-b border-slate-200 bg-white/90 py-4 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
        <Link href="/" className="text-xl font-semibold text-slate-900">
          OPDFlow
        </Link>

        <nav className="flex items-center gap-4 text-sm text-slate-700">
          <Link href="/" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
            Home
          </Link>
          <Link href="/book" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
            Book
          </Link>
          <Link href="/status" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
            Status
          </Link>
          <Link href="/dashboard" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
            Dashboard
          </Link>
          <Link href="/doctors" className="rounded-full px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900">
            Doctors
          </Link>
        </nav>
      </div>
    </header>
  );
}
