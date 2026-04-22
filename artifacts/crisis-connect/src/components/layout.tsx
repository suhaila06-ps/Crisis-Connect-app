import { Link, useLocation } from "wouter";
import { useRole } from "@/hooks/use-role";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Moon, Sun, ShieldAlert, LogOut } from "lucide-react";
import { AlertReportedBy } from "@workspace/api-client-react";
import { EmergencyBanner } from "@/components/emergency-banner";
import { QuickActions } from "@/components/quick-actions";

export function Layout({ children }: { children: React.ReactNode }) {
  const { role, setRole } = useRole();
  const { theme, setTheme } = useTheme();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    setRole(null);
    setLocation("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <EmergencyBanner />

      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link
            href={
              role === AlertReportedBy.guest
                ? "/report"
                : role === AlertReportedBy.admin
                ? "/admin"
                : role === AlertReportedBy.staff
                ? "/dashboard"
                : "/"
            }
            className="flex items-center gap-2 font-bold text-lg hover:opacity-80 transition-opacity"
          >
            <ShieldAlert className="h-6 w-6 text-primary" />
            <span>CrisisConnect</span>
          </Link>

          <div className="flex items-center gap-4">
            {role && (
              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground hidden sm:inline-block">
                  Role: <span className="font-medium text-foreground capitalize">{role}</span>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="gap-2 text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Switch Role</span>
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

      <QuickActions />
    </div>
  );
}
