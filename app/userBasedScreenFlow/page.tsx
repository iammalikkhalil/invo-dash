import Sidebar from "@/components/Sidebar";
import { UserBasedScreenFlowDashboard } from "@/features/user-based-screen-flow/UserBasedScreenFlowDashboard";

export const metadata = {
  title: "User Based Screen Flow | invotics",
  description: "Timeline view for a single user's screen flow sessions",
};

export default function UserBasedScreenFlowPage() {
  return (
    <main className="app-shell">
      <Sidebar />
      <div className="app-main">
        <UserBasedScreenFlowDashboard />
      </div>
    </main>
  );
}
