import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <AlertCircleIcon className="size-10 text-muted-foreground" aria-hidden="true" />
          <CardTitle>Page not found</CardTitle>
          <CardDescription>The resource you are looking for does not exist or has been removed.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button render={<Link href="/dashboard">Back to dashboard</Link>} />
          <Button variant="outline" render={<Link href="/">Home</Link>} />
        </CardContent>
      </Card>
    </main>
  );
}
