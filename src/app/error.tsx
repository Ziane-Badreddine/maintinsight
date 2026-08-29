"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[MaintInsight Error]", error);
  }, [error]);

  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="items-center">
          <AlertTriangleIcon className="size-10 text-destructive" aria-hidden="true" />
          <CardTitle>Something went wrong</CardTitle>
          <CardDescription>We are working to resolve the problem. Please try again.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button onClick={reset}>Try again</Button>
          <Button variant="outline" render={<Link href="/dashboard">Back to dashboard</Link>} />
        </CardContent>
      </Card>
    </main>
  );
}
