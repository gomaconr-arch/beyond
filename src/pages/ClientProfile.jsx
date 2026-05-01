import { Navigate, useParams } from "react-router-dom";
import { useAppStore } from "../store/appStore";
import { useAuth } from "../hooks/useAuth";
import { usePrivacy } from "../hooks/usePrivacy";
import PrivacyToggle from "../components/ui/PrivacyToggle";
import RPGCharacterCard from "../components/profile/RPGCharacterCard";
import ClientStatsTabs from "../components/profile/ClientStatsTabs";
import ProfileComparisonPanel from "../components/profile/ProfileComparisonPanel";

export default function ClientProfile() {
  const { clientId } = useParams();
  const { authUser, isAdmin } = useAuth();
  const { isPublic, setPrivacy } = usePrivacy();
  const clients = useAppStore((s) => s.clients);
  const decoded = decodeURIComponent(clientId || "");
  const client = clients.find((c) => c.sheet === decoded);

  if (!client) return <Navigate to="/community" replace />;

  const isOwner = authUser?.clientSheet === client.sheet;
  const canView = isAdmin || isOwner || isPublic(client.sheet);

  if (!canView) {
    return (
      <div className="card-surface relative overflow-hidden p-10 text-center">
        <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-sm" />
        <p className="relative text-xl text-slate-700">This member's profile is not publicly visible.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-slate-900">Member Profile</h1>
          <p className="text-slate-600">Body Composition Overview and progress reports.</p>
        </div>
      </div>

      <ProfileComparisonPanel member={client} members={clients} />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]">
        <RPGCharacterCard
          client={client}
          showUnearnedMilestones={false}
          headerControl={isOwner ? <PrivacyToggle isPublic={isPublic(client.sheet)} onToggle={() => setPrivacy(client.sheet, !isPublic(client.sheet))} /> : null}
        />
        <ClientStatsTabs client={client} />
      </div>
    </div>
  );
}
