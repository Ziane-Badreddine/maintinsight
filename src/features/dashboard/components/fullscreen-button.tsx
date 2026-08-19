"use client";

import { Button } from "@/components/ui/button";
import { useFullscreen } from "@/hooks/use-fullscreen";
import { Maximize, Minimize } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Kbd } from "@/components/ui/kbd";
import { useHotkey } from "@tanstack/react-hotkeys";

export default function FullscreenButton() {
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  useHotkey("F", () => {
    toggleFullscreen();
  });

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className=" rounded-full"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? (
              <Minimize className="transition-all group-hover:scale-120" />
            ) : (
              <Maximize className="transition-all group-hover:scale-120" />
            )}
          </Button>
        }
      />
      <TooltipContent>
        Full screen <Kbd>F</Kbd>
      </TooltipContent>
    </Tooltip>
  );
}
