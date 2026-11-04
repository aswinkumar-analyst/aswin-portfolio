import { useCallback, useEffect, useState } from "react";

const PARAM = "case";

// The open case study lives in the query string (?case=<id>), so a link to it
// can be shared and the Back button closes it. It never touches the #hash,
// which belongs to in-page navigation (lib/scroll), and never reloads.
//
//   open   pushState, so Back returns to the page as it was
//   swap   replaceState, so browsing to the next case is not one Back per case
//   close  history.back() when we pushed the entry, otherwise (a shared link
//          landed here) strip the param in place: Back would leave the site
export function useCaseRoute(ids) {
  const read = useCallback(() => {
    const id = new URLSearchParams(window.location.search).get(PARAM);
    return ids.includes(id) ? id : null;
  }, [ids]);

  const [caseId, setCaseId] = useState(read);

  useEffect(() => {
    const onPop = () => setCaseId(read());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [read]);

  const urlWith = (id) => {
    const url = new URL(window.location.href);
    if (id) url.searchParams.set(PARAM, id);
    else url.searchParams.delete(PARAM);
    return url;
  };

  const open = useCallback((id) => {
    window.history.pushState({ [PARAM]: id }, "", urlWith(id));
    setCaseId(id);
  }, []);

  const swap = useCallback((id) => {
    window.history.replaceState(window.history.state, "", urlWith(id));
    setCaseId(id);
  }, []);

  const close = useCallback(() => {
    if (window.history.state?.[PARAM]) {
      window.history.back(); // popstate clears caseId
    } else {
      window.history.replaceState(null, "", urlWith(null));
      setCaseId(null);
    }
  }, []);

  return { caseId, open, swap, close };
}
