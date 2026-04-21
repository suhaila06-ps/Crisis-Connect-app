import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { EmergencyType, useCreateAlert, AlertReportedBy } from "@workspace/api-client-react";
import { useRole } from "@/hooks/use-role";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  location: z.string().min(1, "Room number or location is required"),
  type: z.nativeEnum(EmergencyType),
  description: z.string().optional().default(""),
});

type FormValues = z.infer<typeof formSchema>;

export function Report() {
  const { role } = useRole();
  const [, setLocation] = useLocation();
  const [submitted, setSubmitted] = useState(false);
  
  useEffect(() => {
    if (!role) {
      setLocation("/");
    }
  }, [role, setLocation]);

  const createAlert = useCreateAlert();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      type: EmergencyType.other,
      description: "",
    },
  });

  const onSubmit = (values: FormValues) => {
    if (!role) return;
    
    createAlert.mutate(
      {
        data: {
          ...values,
          reportedBy: role as AlertReportedBy,
        },
      },
      {
        onSuccess: () => {
          setSubmitted(true);
          toast.success("Emergency alert sent successfully");
        },
        onError: () => {
          toast.error("Failed to send alert. Please try again.");
        },
      }
    );
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto pt-12">
        <Card className="border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 text-center">
          <CardContent className="pt-12 pb-12">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h2 className="text-2xl font-bold mb-2">Alert Sent</h2>
            <p className="text-muted-foreground mb-8">
              Emergency services have been notified and are responding to your location. Please remain calm.
            </p>
            <Button onClick={() => {
              form.reset();
              setSubmitted(false);
            }} variant="outline">
              Report Another Incident
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto pt-8">
      <Card className="border-destructive/20 shadow-lg">
        <CardHeader className="bg-destructive/5 border-b border-destructive/10 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <AlertCircle className="w-8 h-8 text-destructive" />
            <CardTitle className="text-2xl text-destructive">Report Emergency</CardTitle>
          </div>
          <CardDescription className="text-base">
            Please provide details about the emergency. Help will be dispatched immediately.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-base font-semibold">Emergency Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 text-lg">
                          <SelectValue placeholder="Select type of emergency" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value={EmergencyType.fire}>🔥 Fire</SelectItem>
                        <SelectItem value={EmergencyType.medical}>❤️ Medical</SelectItem>
                        <SelectItem value={EmergencyType.security}>🛡️ Security</SelectItem>
                        <SelectItem value={EmergencyType.other}>⚠️ Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Room Number / Location</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Room 402, Lobby" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Briefly describe the situation..." 
                        className="resize-none h-24"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                size="lg" 
                className="w-full text-lg h-14" 
                variant="destructive"
                disabled={createAlert.isPending}
              >
                {createAlert.isPending ? "Sending..." : "SEND ALERT"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
