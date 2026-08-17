// features/auth/lib/parse-user-agent.ts
interface OsInfo {
  label: string; // "Windows", "macOS", etc.
  deviceType: "Mobile" | "Tablet" | "Desktop";
}

export function parseUserAgent(userAgent: string | null | undefined) {
  if (!userAgent) {
    return {
      os: { label: "Unknown device", deviceType: "Desktop" as const },
      browserLabel: "Unknown browser",
    };
  }

  const isMobile = /mobile/i.test(userAgent);
  const isTablet = /tablet|ipad/i.test(userAgent);
  const deviceType: OsInfo["deviceType"] = isTablet
    ? "Tablet"
    : isMobile
      ? "Mobile"
      : "Desktop";

  let osLabel = "Unknown OS";
  if (/windows/i.test(userAgent)) osLabel = "Windows";
  else if (/mac os/i.test(userAgent)) osLabel = "macOS";
  else if (/android/i.test(userAgent)) osLabel = "Android";
  else if (/iphone|ios/i.test(userAgent)) osLabel = "iOS";
  else if (/linux/i.test(userAgent)) osLabel = "Linux";

  // Capture nom + version du navigateur (ex: "Edg/151.0.0.0" -> "Edge 151.0.0.0")
  let browserLabel = "Unknown browser";

  const edgeMatch = userAgent.match(/Edg\/([\d.]+)/);
  const chromeMatch = userAgent.match(/Chrome\/([\d.]+)/);
  const firefoxMatch = userAgent.match(/Firefox\/([\d.]+)/);
  const safariMatch = userAgent.match(/Version\/([\d.]+).*Safari/);

  if (edgeMatch) {
    browserLabel = `Edge ${edgeMatch[1]}`;
  } else if (firefoxMatch) {
    browserLabel = `Firefox ${firefoxMatch[1]}`;
  } else if (chromeMatch) {
    browserLabel = `Chrome ${chromeMatch[1]}`;
  } else if (safariMatch) {
    browserLabel = `Safari ${safariMatch[1]}`;
  }

  return {
    os: { label: osLabel, deviceType },
    browserLabel,
  };
}
