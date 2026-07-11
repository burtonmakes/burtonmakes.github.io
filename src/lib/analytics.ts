export type AnalyticsPrimitive = string | number | boolean;
export type AnalyticsValue = AnalyticsPrimitive | null | undefined;
export type AnalyticsProps = Record<string, AnalyticsValue>;

type PlausibleOptions = {
  props?: Record<string, AnalyticsPrimitive>;
};

type PlausibleFunction = {
  (eventName: string, options?: PlausibleOptions): void;
  q?: unknown[];
  o?: Record<string, unknown>;
  init?: (options?: Record<string, unknown>) => void;
};

declare global {
  interface Window {
    plausible?: PlausibleFunction;
  }
}

const removeSiteNotice = (): void => {
  if (typeof document === "undefined") return;
  document.querySelector(".site-notice")?.remove();
};

if (typeof document !== "undefined") {
  removeSiteNotice();
  document.addEventListener("astro:page-load", removeSiteNotice);
}

const isPrimitive = (value: unknown): value is AnalyticsPrimitive =>
  typeof value === "string" || typeof value === "number" || typeof value === "boolean";

const cleanProps = (props: AnalyticsProps): Record<string, AnalyticsPrimitive> =>
  Object.fromEntries(
    Object.entries(props).filter(([, value]) => isPrimitive(value))
  ) as Record<string, AnalyticsPrimitive>;

export function trackEvent(name: string, props: AnalyticsProps = {}): void {
  try {
    if (typeof window === "undefined") {
      return;
    }

    const plausible = window.plausible;
    if (typeof plausible !== "function") {
      return;
    }

    const cleanedProps = cleanProps(props);
    if (Object.keys(cleanedProps).length === 0) {
      plausible(name);
      return;
    }

    plausible(name, { props: cleanedProps });
  } catch {
    // Analytics should never break the page.
  }
}
