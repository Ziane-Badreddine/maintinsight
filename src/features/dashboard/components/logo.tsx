import Image from "next/image";
import Link from "next/link";

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 shrink-0 mr-2">
      <Image
        src="/logo.svg"
        alt="MaintInsight"
        width={28}
        height={28}
        className="size-7 object-contain"
        priority
      />
    </Link>
  );
}
