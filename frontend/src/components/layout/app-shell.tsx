import Sidebar from "@/components/layout/sidebar";
import BottomNav from "@/components/layout/bottom-nav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-full">
      {/* PC: fixed left sidebar (240px wide) */}
      <Sidebar />

      {/* Main content: offset by sidebar on large screens, padded for bottom nav on mobile */}
      <main className="lg:pl-[240px] pb-14 lg:pb-0 min-h-screen">
        {children}
      </main>

      {/* Mobile: fixed bottom navigation */}
      <BottomNav />
    </div>
  );
}
