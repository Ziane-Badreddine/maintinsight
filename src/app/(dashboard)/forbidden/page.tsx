import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlertIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Access denied",
  robots: { index: false, follow: false },
};

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-[60vh] items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <ShieldAlertIcon className="size-10 text-muted-foreground" aria-hidden="true" />
          <CardTitle>Access denied</CardTitle>
          <CardDescription>You do not have permission to access this resource.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/dashboard">Back to dashboard</Link>} />
        </CardContent>
      </Card>
    </main>
  );
}
