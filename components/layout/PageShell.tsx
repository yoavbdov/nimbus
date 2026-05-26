import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

interface PageShellProps {
  title: string;
  children: React.ReactNode;
}

export function PageShell({ title, children }: PageShellProps) {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      <div className="flex-1 flex flex-col lg:ms-56 min-w-0">
        <TopBar title={title} />
        <main className="flex-1 px-4 sm:px-6 py-6">
          <div className="max-w-screen-xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
