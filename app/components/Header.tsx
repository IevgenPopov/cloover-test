"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
    const [open, setOpen] = useState(false);

    return (
        <header className="w-full bg-white/90 dark:bg-black/80 backdrop-blur sticky top-0 z-40 border-b">
            <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-3">
                    <div
                        className="w-11 h-11 rounded-lg bg-gradient-to-br from-[#0B9A96] to-[#0EA5A4] flex items-center justify-center text-white font-bold shadow">C
                    </div>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">Cloover</span>
                </Link>

                <nav className="hidden md:flex items-center gap-2 text-sm">
                    <Link href="/quotes" className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800">
                        Quotes
                    </Link>
                    <Link href="/quote" className="rounded-md px-3 py-2 text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-slate-800">
                        New quote
                    </Link>
                </nav>

                {/* Mobile menu button */}
                <div className="md:hidden">
                    <button onClick={() => setOpen((s) => !s)} aria-label="Toggle menu" className="p-2 rounded-md bg-gray-100 dark:bg-slate-800">
                        <svg className="w-5 h-5 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            {open ? (
                                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>
                </div>
            </div>
        </header>
    );
}
