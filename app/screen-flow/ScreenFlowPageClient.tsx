"use client";

import { useSyncExternalStore } from "react";
import Sidebar from "@/components/Sidebar";
import { ScreenFlowDashboard } from "@/features/screen-flow";

function subscribe() {
  return () => {};
}

function getClientSnapshot() {
  return true;
}

function getServerSnapshot() {
  return false;
}

export default function ScreenFlowPageClient() {
  const isClient = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  return (
    <main className="app-shell">
      <Sidebar />
      <div className="app-main">
        {isClient ? <ScreenFlowDashboard /> : null}
      </div>
    </main>
  );
}
