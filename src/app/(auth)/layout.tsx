import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access your MaintInsight dashboard.",
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return children;
}
