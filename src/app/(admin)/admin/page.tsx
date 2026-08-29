import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Manage MaintInsight administration.",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return <div>AdminPage</div>;
}
