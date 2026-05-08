import DashboardShell from "@/components/dashboard/DashboardShell";
import PasswordGate from "@/components/auth/PasswordGate";

export default function Home() {
  return (
    <PasswordGate>
      <DashboardShell />
    </PasswordGate>
  );
}
