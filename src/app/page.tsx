import { redirect } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Home",
  description: "Maintenance intelligence for cities, plants, workshops, and equipment.",
  robots: { index: false, follow: false },
};

export default function Home() {
  redirect("/dashboard");
  return <main>hi</main>;
}
