import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut } from "next-auth/react";
import type { DefaultSession } from "next-auth";
import { trackNavigation } from "@/utils/analytics";
import { getMissionViewPreference } from "@/utils/missionPreferences";

interface HeaderProps {
  user: DefaultSession["user"] | null;
}

const Header: React.FC<HeaderProps> = ({ user }) => {
  const router = useRouter();
  const [missionHref, setMissionHref] = useState("/mission");
  const handleSignOut = () => {
    trackNavigation('sign_out');
    signOut();
  };

  useEffect(() => {
    const preference = getMissionViewPreference();
    if (preference) {
      setMissionHref(`/mission/${preference}`);
    }
  }, [router.pathname]);

  const navItems = [
    { label: "Dashboard", href: "/" },
    { label: "Mission Control", href: missionHref },
    { label: "Recurring", href: "/recurring" },
    { label: "Legal", href: "/legal" },
  ];

  return (
    <div className="border-b border-warm-border bg-warm-black sticky top-0 z-40">
      <div className="container mx-auto flex flex-col gap-4 py-4 px-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="no-underline">
            <div className="flex flex-col">
              <span className="text-xl font-semibold text-white tracking-tight">Tally</span>
              <span className="text-xs text-warm-gray hidden sm:inline">Tally - Your Todoist Command Center</span>
            </div>
          </Link>
          {user && (
            <nav className="hidden md:flex items-center gap-4">
              {navItems.map((item) => {
                const isMission = item.label === "Mission Control";
                const isActive = isMission
                  ? router.pathname.startsWith("/mission")
                  : router.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-sm font-medium no-underline transition-colors ${
                      isActive ? "text-warm-peach" : "text-warm-gray hover:text-white"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-4 justify-between sm:justify-end">
            <span className="text-sm text-warm-gray truncate max-w-[220px]">{user.email}</span>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-sm text-white bg-warm-peach rounded-xl hover:opacity-90 transition-opacity font-medium"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
      {user && (
        <div className="md:hidden border-t border-warm-border">
          <div className="container mx-auto flex items-center gap-4 px-6 py-3 overflow-x-auto">
            {navItems.map((item) => {
              const isMission = item.label === "Mission Control";
              const isActive = isMission
                ? router.pathname.startsWith("/mission")
                : router.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium whitespace-nowrap no-underline transition-colors ${
                    isActive ? "text-warm-peach" : "text-warm-gray hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
