import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

function SignInFallback() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-9 w-48 rounded-lg bg-muted" />
      <div className="h-4 w-64 rounded bg-muted" />
      <div className="h-10 rounded-lg bg-muted mt-6" />
      <div className="h-10 rounded-lg bg-muted" />
      <div className="h-10 rounded-lg bg-muted" />
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInForm />
    </Suspense>
  );
}
