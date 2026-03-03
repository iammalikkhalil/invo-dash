"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingState from "@/components/LoadingState";
import { isLoggedIn } from "@/lib/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(isLoggedIn() ? "/users" : "/login");
  }, [router]);

  return (
    <main className="center-screen">
      <LoadingState message="Preparing webpanel..." />
    </main>
  );
}
