interface IpLocation {
  city: string | null;
  country: string | null;
}

export async function getIpLocation(ip: string): Promise<IpLocation> {
  // IPs locales/privées n'ont pas de géoloc
  if (
    !ip ||
    ip === "127.0.0.1" ||
    ip === "::1" ||
    ip.startsWith("192.168.") ||
    ip.startsWith("10.")
  ) {
    return { city: null, country: null };
  }

  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,city,country`,
      { next: { revalidate: 3600 } }, // cache 1h — évite de re-résoudre à chaque render
    );
    const data = await res.json();

    if (data.status !== "success") {
      return { city: null, country: null };
    }

    return { city: data.city ?? null, country: data.country ?? null };
  } catch {
    return { city: null, country: null };
  }
}
