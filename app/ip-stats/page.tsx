// app/ip-stats/page.tsx
// Server Component — no "use client"

import { IpStatsDashboard } from "@/features/ip-stats";
import Sidebar from "@/components/Sidebar";

export const metadata = {
    title: "IP Intelligence | invotics",
    description: "IP security monitoring dashboard",
};

export default function IpStatsPage() {
    return <main className="app-shell">
        <Sidebar />
        <div className="app-main">
            <IpStatsDashboard />;
        </div>
    </main>;
}