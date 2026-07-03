"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/components/nav-items";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed top-0 left-0 bottom-0 w-[240px] bg-navy">
      {/* Logo */}
      <div className="px-6 py-[26px] border-b border-white/10 font-serif text-[20px] font-bold text-white tracking-[0.05em]">
        mis<span className="text-amber-br">note</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-0.5 p-3 flex-1">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={[
                "flex items-center gap-2.5 rounded-md text-[13px] font-medium tracking-[0.02em] transition-colors duration-150",
                "py-2.5",
                isActive
                  ? "bg-amber-br/20 text-white border-l-[3px] border-amber-br pl-[11px] pr-[14px]"
                  : "text-white/50 pl-[14px] pr-[14px] hover:bg-white/7 hover:text-white/85",
              ].join(" ")}
            >
              <Icon />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
