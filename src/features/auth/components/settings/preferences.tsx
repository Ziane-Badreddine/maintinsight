"use client";

import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Preferences() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ] as const;

  return (
    <div className="max-w-lg space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Theme</h3>
        <div className="flex gap-2">
          {options.map((opt) => (
            <Button
              key={opt.value}
              variant={theme === opt.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTheme(opt.value)}
              className={cn("gap-1.5")}
            >
              <opt.icon className="size-3.5" />
              {opt.label}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}
