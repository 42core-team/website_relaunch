"use client";
import { Link } from "@heroui/react";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo } from "react";

interface EventNavbarProps {
  eventId: string;
  isUserRegistered?: boolean;
  isEventAdmin?: boolean;
}

export default function EventNavbar({
  eventId,
  isUserRegistered = false,
  isEventAdmin = false,
}: EventNavbarProps) {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(pathname);
  }, [pathname]);

  const navItems = useMemo(() => {
    const baseItems = [
      { name: "Info", path: `/events/${eventId}` },
      ...(isUserRegistered
        ? [
            { name: "My Team", path: `/events/${eventId}/my-team` },
            { name: "Queue", path: `/events/${eventId}/queue` },
          ]
        : []),
      { name: "Teams", path: `/events/${eventId}/teams` },
      { name: "Group Phase", path: `/events/${eventId}/groups` },
      { name: "Tournament Tree", path: `/events/${eventId}/bracket` },
    ];

    return isEventAdmin
      ? [
          ...baseItems,
          { name: "Dashboard", path: `/events/${eventId}/dashboard` },
        ]
      : baseItems;
  }, [eventId, isUserRegistered, isEventAdmin]);

  return (
    <div className="w-full border-t border-divider">
      <nav className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-center gap-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            onPress={() => setActiveTab(item.path)}
            aria-current={
              (activeTab || pathname) === item.path ? "page" : undefined
            }
            className={`text-base hover:text-primary transition-colors ${
              (activeTab || pathname) === item.path
                ? "text-primary font-medium border-b-2 border-primary pb-1"
                : "text-foreground-500"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </nav>
    </div>
  );
}
