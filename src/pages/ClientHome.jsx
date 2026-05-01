import { Navigate } from "react-router-dom";
import RPGCharacterCard from "../components/profile/RPGCharacterCard";
import ClientStatsTabs from "../components/profile/ClientStatsTabs";
import ProfileComparisonPanel from "../components/profile/ProfileComparisonPanel";
import PrivacyToggle from "../components/ui/PrivacyToggle";
import { useAppStore } from "../store/appStore";
import { useAuth } from "../hooks/useAuth";
import { usePrivacy } from "../hooks/usePrivacy";

export default function ClientHome() {
  const { authUser } = useAuth();
  const clients = useAppStore((s) => s.clients);
  const { isPublic, setPrivacy } = usePrivacy();

  const client = clients.find((c) => c.sheet === authUser?.clientSheet);
  if (!client) return <Navigate to="/login" replace />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl text-slate-900">My Wellness Summary</h1>
        <p className="text-slate-600">Body Composition Overview and Wellness Assessment reports.</p>
      </div>

      <ProfileComparisonPanel member={client} members={clients} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]">
        <RPGCharacterCard
          client={client}
          headerControl={<PrivacyToggle isPublic={isPublic(client.sheet)} onToggle={() => setPrivacy(client.sheet, !isPublic(client.sheet))} />}
        />
        <ClientStatsTabs client={client} />
      </div>
    </div>
  );
}
