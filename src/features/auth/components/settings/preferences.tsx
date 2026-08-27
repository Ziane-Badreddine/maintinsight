"use client";

import { useTheme } from "next-themes";
import { Laptop, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Preferences() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System", icon: Laptop },
  ] as const;

  return (
    <div className="max-w-2xl flex flex-col gap-2">
      <Tabs>
        <TabsList
          variant="line"
          className="mb-2 sticky top-0 bg-transparent z-10"
        >
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>
        <ScrollArea className={"h-[calc(480px-80px+16px)] pr-4 "}>
          <TabsContent value={"theme"}>
            <div className="flex gap-2 mt-2.5">
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
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}
