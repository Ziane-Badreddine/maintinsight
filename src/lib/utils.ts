import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { isToday, isYesterday, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | string) {
  const d = typeof date === "string" ? new Date(date) : date;

  if (isToday(d)) {
    return `Today at ${format(d, "h:mm a")}`;
  }

  if (isYesterday(d)) {
    return `Yesterday at ${format(d, "h:mm a")}`;
  }

  return format(d, "MMM d 'at' h:mm a");
}
