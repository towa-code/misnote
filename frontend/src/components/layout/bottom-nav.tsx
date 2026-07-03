"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/layout/nav-items";

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-navy border-t border-white/10 flex">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={[
              "flex flex-1 flex-col items-center justify-center gap-1 min-h-[56px] text-[11px] font-medium tracking-[0.03em] transition-colors duration-150",
              isActive ? "text-amber-br" : "text-white/50 hover:text-white/85",
            ].join(" ")}
          >
            <Icon />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
