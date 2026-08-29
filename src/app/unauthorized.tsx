import type { Metadata } from "next";

import Link from "next/link";

import { LogInIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Unauthorized",
  robots: { index: false, follow: false },
};

export default function Unauthorized() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-md text-center bg-transparent outline-none border-0 ring-0">
        <CardHeader>
          <div className="flex items-center mb-4 justify-center">
            <LogInIcon
              className="size-10 text-muted-foreground"
              aria-hidden="true"
            />
          </div>
          <CardTitle>401 - Unauthorized</CardTitle>

          <CardDescription>
            You need to sign in to access this resource.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/login">
            <Button>Login</Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
