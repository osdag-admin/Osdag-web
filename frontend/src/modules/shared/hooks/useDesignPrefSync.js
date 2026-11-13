import { useEffect, useRef } from "react";
import { fetchDesignPrefSync } from "../../../datasources/modulesDataSource";
import { mergeLinkedParityKeysIntoInputs } from "../utils/mergeDesignPrefSyncIntoInputs";

const DEBOUNCE_MS = 200;

/**
 * Keep main `inputs` material preference keys in sync with the
 * input dock (driving grade) through backend refresh.
 */
export function useDesignPrefSync({
  sessionName,
  inputs,
  setInputs,
  applyStrictLinkedReseed,
  setLastKnownGoodDesignPrefSnapshot,
  /** When true, Additional Inputs modal owns refresh calls. */
  pause = false,
}) {
  const abortRef = useRef(null);
  const reqGen = useRef(0);
  const inputsRef = useRef(inputs);
  inputsRef.current = inputs;

  /**
   * When the modal opens we record the current driver value. When the modal
   * closes (pause: true → false) we compare: if the driver hasn't changed we
   * skip the refresh so user-saved pref overrides are not clobbered.
   * If the driver DID change while the modal was open, the modal's own
   * runSync("refresh") already handled it; we still skip to avoid a duplicate.
   */
  const driverAtPauseRef = useRef(null);

  useEffect(() => {
    if (!sessionName || !setInputs) return;

    const latest = inputsRef.current;
    const driver = latest?.connector_material ?? latest?.material ?? latest?.member_material;

    if (pause) {
      // Record driver value when modal opens so we can detect no-change on close.
      driverAtPauseRef.current = driver ?? null;
      abortRef.current?.abort();
      return;
    }

    // Modal just closed: skip refresh if driver is unchanged.
    if (driverAtPauseRef.current !== null) {
      const wasDriver = driverAtPauseRef.current;
      driverAtPauseRef.current = null;
      if (driver === wasDriver) return;
    }

    if (!driver) return;

    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    const myGen = ++reqGen.current;

    const t = setTimeout(async () => {
      const snap = inputsRef.current;
      const body = {
        module_session_name: sessionName,
        inputs: snap,
        operation: "refresh",
      };
      const res = await fetchDesignPrefSync(body, ac.signal);
      if (myGen !== reqGen.current) return;
      if (!res.success) {
        if (res.aborted) return;
        return;
      }
      const { data } = res;
      const resolvedInputs = data.resolved_inputs || {};
      const metadata = data.metadata;
      let mergedSnapshotInputs = null;
      setInputs((prev) => {
        const next = mergeLinkedParityKeysIntoInputs(prev, resolvedInputs, metadata);
        mergedSnapshotInputs = next;
        return next;
      });
      const snapshot = {
        resolved_inputs: mergedSnapshotInputs || { ...inputsRef.current },
        material_details: data.material_details,
        metadata: data.metadata,
      };
      applyStrictLinkedReseed?.({
        material_details: data.material_details,
        metadata: data.metadata,
        snapshot,
      });
      setLastKnownGoodDesignPrefSnapshot(snapshot);
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [
    sessionName,
    inputs?.connector_material,
    inputs?.material,
    inputs?.member_material,
    setInputs,
    applyStrictLinkedReseed,
    setLastKnownGoodDesignPrefSnapshot,
    pause,
  ]);
}
