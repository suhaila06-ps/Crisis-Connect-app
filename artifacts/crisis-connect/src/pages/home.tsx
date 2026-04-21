import { useRole } from "@/hooks/use-role";
import { AlertReportedBy } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, UserSquare, Shield, Settings } from "lucide-react";
import { useEffect } from "react";

export function Home() {
  const { role, setRole } = useRole();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (role === AlertReportedBy.guest) setLocation("/report");
    if (role === AlertReportedBy.staff) setLocation("/dashboard");
    if (role === AlertReportedBy.admin) setLocation("/admin");
  }, [role, setLocation]);

  const handleSelectRole = (selectedRole: AlertReportedBy) => {
    setRole(selectedRole);
  };

  return (
    <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="bg-primary/10 p-6 rounded-full mb-8">
        <ShieldAlert className="w-16 h-16 text-primary" />
      </div>
      
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
        CrisisConnect
      </h1>
      <p className="text-xl text-muted-foreground mb-12 max-w-xl">
        Real-time emergency response coordination for hospitality teams. Please select your role to continue.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleSelectRole(AlertReportedBy.guest)}>
          <CardHeader>
            <UserSquare className="w-10 h-10 mb-4 text-blue-500" />
            <CardTitle>Guest</CardTitle>
            <CardDescription>Report an emergency or request immediate assistance to your location.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer border-2" onClick={() => handleSelectRole(AlertReportedBy.staff)}>
          <CardHeader>
            <Shield className="w-10 h-10 mb-4 text-amber-500" />
            <CardTitle>Staff</CardTitle>
            <CardDescription>View active emergencies, coordinate responses, and update status.</CardDescription>
          </CardHeader>
        </Card>

        <Card className="hover:border-primary/50 transition-colors cursor-pointer" onClick={() => handleSelectRole(AlertReportedBy.admin)}>
          <CardHeader>
            <Settings className="w-10 h-10 mb-4 text-violet-500" />
            <CardTitle>Admin</CardTitle>
            <CardDescription>Manage all incidents, view analytics, and review resolved alerts history.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
