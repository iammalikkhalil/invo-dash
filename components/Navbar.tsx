"use client";

import { useRouter } from "next/navigation";
import { clearAccessToken } from "@/lib/auth";

interface NavbarProps {
  title: string;
  showLogout?: boolean;
}

export default function Navbar({ title, showLogout = true }: NavbarProps) {
  const router = useRouter();

  function onLogout() {
    clearAccessToken();
    router.replace("/login");
  }

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h1>{title}</h1>
      </div>
      {showLogout ? (
        <button type="button" className="btn btn-outline" onClick={onLogout}>
          Logout
        </button>
      ) : null}
    </header>
  );
}
