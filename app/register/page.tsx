import { Suspense } from "react";
import LoginForm from "@/app/components/LoginForm";

export default function Page() {
  return (
    <Suspense>
      <LoginForm mode="signup" />
    </Suspense>
  );
}
