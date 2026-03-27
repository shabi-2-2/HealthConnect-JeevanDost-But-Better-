"use client";

import { motion } from "framer-motion";
import {
    Heart,
    MapPin,
    Activity,
    Lightbulb,
    CalendarDays,
    AlertTriangle,
    Mail,
} from "lucide-react";

import { cn } from "@/lib/utils";

const MOBILE_LABEL_WIDTH = 80;

export const healthNavItems = [
    { label: "Home", icon: Heart, id: "home" },
    { label: "Find Doctors", icon: MapPin, id: "find" },
    { label: "Specialties", icon: Activity, id: "specialties" },
    { label: "Health Tips", icon: Lightbulb, id: "tips" },
    { label: "Book", icon: CalendarDays, id: "book" },
    { label: "Emergency", icon: AlertTriangle, id: "emergency" },
    { label: "Contact", icon: Mail, id: "contact" },
];

type NavBarProps = {
    activeId: string;
    onChange: (id: string) => void;
    className?: string;
    sticky?: boolean;
};

export function BottomNavBar({ activeId, onChange, className, sticky = false }: NavBarProps) {
    return (
        <motion.nav
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            role="navigation"
            aria-label="Main Navigation"
            className={cn(
                "flex items-center gap-1 p-1.5 rounded-full",
                "bg-white/8 border border-white/15 backdrop-blur-xl shadow-2xl shadow-black/40",
                sticky && "fixed inset-x-0 bottom-5 mx-auto z-50 w-fit",
                className
            )}
        >
            {healthNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeId === item.id;
                const isEmergency = item.id === "emergency";

                return (
                    <motion.button
                        key={item.id}
                        whileTap={{ scale: 0.93 }}
                        onClick={() => onChange(item.id)}
                        aria-label={item.label}
                        aria-current={isActive ? "page" : undefined}
                        type="button"
                        className={cn(
                            "relative flex items-center rounded-full px-3 py-2 h-9 min-w-[40px] transition-colors duration-200 focus:outline-none",
                            isActive && isEmergency
                                ? "bg-red-500/20 text-red-400"
                                : isActive
                                    ? "bg-violet-500/20 text-violet-300"
                                    : isEmergency
                                        ? "text-red-400/60 hover:bg-red-500/10 hover:text-red-400"
                                        : "text-white/40 hover:text-white/80 hover:bg-white/8"
                        )}
                    >
                        {/* Active glow ring */}
                        {isActive && (
                            <motion.span
                                layoutId="nav-pill"
                                className={cn(
                                    "absolute inset-0 rounded-full -z-10",
                                    isEmergency
                                        ? "bg-red-500/15 shadow-[0_0_12px_2px_rgba(239,68,68,0.2)]"
                                        : "bg-violet-500/15 shadow-[0_0_12px_2px_rgba(139,92,246,0.25)]"
                                )}
                                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                            />
                        )}

                        <Icon
                            size={18}
                            strokeWidth={isActive ? 2.5 : 2}
                            aria-hidden
                        />

                        {/* Expanding label */}
                        <motion.div
                            initial={false}
                            animate={{
                                width: isActive ? `${MOBILE_LABEL_WIDTH}px` : "0px",
                                opacity: isActive ? 1 : 0,
                                marginLeft: isActive ? "6px" : "0px",
                            }}
                            transition={{
                                width: { type: "spring", stiffness: 360, damping: 32 },
                                opacity: { duration: 0.18 },
                                marginLeft: { duration: 0.18 },
                            }}
                            className="overflow-hidden flex items-center"
                        >
                            <span className="text-[11px] font-semibold whitespace-nowrap select-none leading-none tracking-wide">
                                {item.label}
                            </span>
                        </motion.div>
                    </motion.button>
                );
            })}
        </motion.nav>
    );
}

export default BottomNavBar;
