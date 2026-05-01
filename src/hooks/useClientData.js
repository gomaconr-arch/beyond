import { useMemo } from "react";
import { useAppStore } from "../store/appStore";
import { getTotalFatReduction, getWellnessTier, getLatestMeasurement } from "../data/clientMetrics";

export function useClientData() {
  const clients = useAppStore((s) => s.clients);

  const summary = useMemo(() => {
    const withLatest = clients.map((client) => ({
      ...client,
      latest: getLatestMeasurement(client),
      sessions: client.measurements.length,
      totalFatReduction: getTotalFatReduction(client.measurements),
      wellnessTier: getWellnessTier(getLatestMeasurement(client)?.physique_rating || 0),
    }));

    return {
      all: clients,
      withLatest,
      totalSessions: clients.reduce((sum, c) => sum + c.measurements.length, 0),
    };
  }, [clients]);

  return summary;
}
