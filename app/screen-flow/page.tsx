import Sidebar from "@/components/Sidebar";
import { ScreenFlowDashboard } from "@/features/screen-flow";

export const metadata = {
  title: "Screen Flow | invotics",
  description: "Admin analytics for merged screen flow trees",
};

export default function ScreenFlowPage() {
  return (
    <main className="app-shell">
      <Sidebar />
      <div className="app-main">
        <ScreenFlowDashboard />
      </div>
    </main>
  );
}
