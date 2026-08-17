// src/emails/components/colors.ts
// Conversion hex des CSS variables oklch() de globals.css (thème "forest/nature"),
// pour les emails — les clients mail ne supportent pas oklch()/CSS variables.
// Valeurs approximées depuis les oklch() du thème :root (mode light uniquement,
// les emails n'ont pas de dark mode fiable cross-client).

export const emailColors = {
  background: "#ffffff", // --background
  foreground: "#4a3c33", // --foreground (brun foncé chaud)

  card: "#ffffff", // --card
  cardForeground: "#4a3c33", // --card-foreground

  primary: "#3f7d42", // --primary (vert forêt)
  primaryForeground: "#ffffff", // --primary-foreground

  secondary: "#e7f0e2", // --secondary (vert très clair)
  secondaryForeground: "#355e37", // --secondary-foreground (vert foncé)

  muted: "#eee7da", // --muted (beige clair)
  mutedForeground: "#6e5c4a", // --muted-foreground (brun moyen)

  accent: "#cbe3c3", // --accent (vert clair)
  accentForeground: "#355e37", // --accent-foreground

  destructive: "#c0392f", // --destructive (rouge)
  destructiveForeground: "#ffffff", // --destructive-foreground

  border: "#ddd2bb", // --border (beige/tan)
  ring: "#3f7d42", // --ring (= primary)
} as const;
