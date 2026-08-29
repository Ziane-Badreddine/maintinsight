import type { Metadata } from "next";
import Link from "next/link";
import { AlertCircleIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md text-center bg-transparent outline-none border-0 ring-0">
        <CardHeader>
          <div className="flex items-center mb-4">
            <AlertCircleIcon
              className="size-10 text-muted-foreground mx-auto"
              aria-hidden="true"
            />
          </div>
          <CardTitle>404 - Page not found</CardTitle>
          <CardDescription>
            The resource you are looking for does not exist or has been removed.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Link href="/dashboard">
            <Button>Back to dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant={"outline"}>Home</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
