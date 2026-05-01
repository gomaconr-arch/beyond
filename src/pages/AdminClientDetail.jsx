import { Navigate, useParams } from "react-router-dom";
import RPGCharacterCard from "../components/profile/RPGCharacterCard";
import ClientStatsTabs from "../components/profile/ClientStatsTabs";
import ProfileComparisonPanel from "../components/profile/ProfileComparisonPanel";
import { useAppStore } from "../store/appStore";

export default function AdminClientDetail() {
  const { clientId } = useParams();
  const clients = useAppStore((s) => s.clients);
  const decoded = decodeURIComponent(clientId || "");
  const client = clients.find((c) => c.sheet === decoded);

  if (!client) return <Navigate to="/admin/dashboard" replace />;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl text-slate-900">Body Composition Report</h1>
      <ProfileComparisonPanel member={client} members={clients} />
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[340px_1fr]">
        <RPGCharacterCard client={client} />
        <ClientStatsTabs client={client} />
      </div>
    </div>
  );
}
