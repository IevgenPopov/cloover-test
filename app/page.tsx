import Header from "@/app/components/Header";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Home() {
    const session = await getServerSession(authOptions);

    if (session?.user) {
        redirect("/quotes");
    }

    return (
        <>
            <Header />

            <main className="max-w-4xl mx-auto px-6 py-24 text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight text-gray-900 dark:text-white">
                    Simple quotes. Smarter decisions.
                </h1>

                <p className="mt-6 text-lg text-gray-600 light:text-gray-300 max-w-2xl mx-auto">
                    Estimate quotes quickly and keep track of results. Lightweight, fast, and easy to extend — sign up to calculate your quotes.
                </p>

                <div className="mt-10 flex justify-center gap-4 flex-wrap">
                    <Link href="/register" className="inline-flex items-center px-6 py-3 rounded-lg text-white bg-linear-to-br from-[#0B9A96] to-[#0EA5A4] hover:from-[#0A897F] hover:to-[#0B9A96]">
                        Get started — Sign up
                    </Link>

                    <Link href="/login" className="inline-flex items-center px-6 py-3 rounded-lg text-white bg-linear-to-br from-[#0B9A96] to-[#0EA5A4] hover:from-[#0A897F] hover:to-[#0B9A96]">
                        Sign in
                    </Link>
                </div>
            </main>
        </>
    );
}
