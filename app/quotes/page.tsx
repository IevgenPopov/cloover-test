import Header from "@/app/components/Header";
import QuotesForm from "@/app/components/QuotesForm";
import { authOptions } from "@/app/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function QuotesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <Header />
      <main className="bg-background">
        <QuotesForm user={session.user} />
      </main>
    </>
  );
}
