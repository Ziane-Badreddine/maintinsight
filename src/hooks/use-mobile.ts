import * as React from "react";

const MOBILE_BREAKPOINT = 768;

const getMediaQuery = () => `(max-width: ${MOBILE_BREAKPOINT - 1}px)`;

export function useIsMobile() {
  const subscribe = React.useCallback((callback: () => void) => {
    const mql = window.matchMedia(getMediaQuery());

    mql.addEventListener("change", callback);

    return () => {
      mql.removeEventListener("change", callback);
    };
  }, []);

  const getSnapshot = React.useCallback(() => {
    return window.matchMedia(getMediaQuery()).matches;
  }, []);

  const getServerSnapshot = React.useCallback(() => {
    return false;
  }, []);

  return React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
