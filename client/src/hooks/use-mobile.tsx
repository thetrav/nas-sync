import * as React from "react";

const MOBILE_BREAKPOINT = 768;
const MOBILE_LAYOUT_BREAKPOINT = 1000;

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}

export function useMobileLayout() {
  const [isMobileLayout, setIsMobileLayout] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_LAYOUT_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobileLayout(window.innerWidth < MOBILE_LAYOUT_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobileLayout(window.innerWidth < MOBILE_LAYOUT_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobileLayout;
}
