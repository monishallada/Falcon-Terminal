import { Terminal } from "@/components/Terminal";
import { AuthGate } from "@/components/auth/AuthGate";

export default function TerminalPage() {
  return (
    <AuthGate>
      <Terminal />
    </AuthGate>
  );
}
