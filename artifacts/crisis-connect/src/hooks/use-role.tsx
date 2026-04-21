import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { AlertReportedBy } from "@workspace/api-client-react";

type RoleContextType = {
  role: AlertReportedBy | null;
  setRole: (role: AlertReportedBy | null) => void;
};

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AlertReportedBy | null>(() => {
    const saved = localStorage.getItem("crisis-connect-role");
    if (saved === AlertReportedBy.guest || saved === AlertReportedBy.staff || saved === AlertReportedBy.admin) {
      return saved as AlertReportedBy;
    }
    return null;
  });

  const setRole = (newRole: AlertReportedBy | null) => {
    setRoleState(newRole);
    if (newRole) {
      localStorage.setItem("crisis-connect-role", newRole);
    } else {
      localStorage.removeItem("crisis-connect-role");
    }
  };

  return (
    <RoleContext.Provider value={{ role, setRole }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
}
