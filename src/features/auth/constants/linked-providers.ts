import { GitGraphIcon, MailIcon } from "lucide-react";

export const SOCIAL_PROVIDERS = [
  { id: "github", name: "GitHub", icon: GitGraphIcon },
  { id: "google", name: "Google", icon: MailIcon },
] as const;

export type SocialProviderId = (typeof SOCIAL_PROVIDERS)[number]["id"];
