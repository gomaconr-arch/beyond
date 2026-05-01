import { useCallback, useMemo } from "react";
import { useAppStore } from "../store/appStore";

export function usePrivacy() {
  const privacyMap = useAppStore((s) => s.privacyMap);
  const setPrivacy = useAppStore((s) => s.setPrivacy);

  const isPublic = useCallback((sheet) => privacyMap[sheet] ?? true, [privacyMap]);

  return useMemo(() => ({ privacyMap, setPrivacy, isPublic }), [privacyMap, setPrivacy, isPublic]);
}
