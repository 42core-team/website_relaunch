'use client';
import { Link } from "@heroui/react";
import { usePathname } from "next/navigation";

interface EventNavbarProps {
    eventId: string;
    isUserRegistered?: boolean;
}

export default function EventNavbar({ eventId, isUserRegistered = false }: EventNavbarProps) {
    const pathname = usePathname();
    
    const navItems = [
        { name: 'Info', path: `/events/${eventId}` },
        ...(isUserRegistered ? [{ name: 'My Team', path: `/events/${eventId}/my-team` }] : []),
        { name: 'Teams', path: `/events/${eventId}/teams` },
        { name: 'Group Phase', path: `/events/${eventId}/groups` },
        { name: 'Tournament Tree', path: `/events/${eventId}/bracket` },
    ];

    return (
        <div className="w-full border-t border-divider">
            <nav className="container mx-auto max-w-7xl px-6 h-16 flex items-center justify-center gap-8">
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        href={item.path}
                        className={`text-base hover:text-primary transition-colors ${
                            pathname === item.path 
                                ? 'text-primary font-medium border-b-2 border-primary pb-1' 
                                : 'text-foreground-500'
                        }`}
                    >
                        {item.name}
                    </Link>
                ))}
            </nav>
        </div>
    );
}
