"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Rocket,
  FlaskConical,
  Globe,
  Users,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  Target,
  BookOpen,
  FileText,
  BarChart3,
  Search,
  Plus,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const mainNav: NavItem[] = [
  { title: "Mission Control", href: "/lab", icon: Home },
  { title: "Challenges", href: "/lab/missions", icon: Target },
  { title: "My Workspace", href: "/lab/workspace", icon: FlaskConical },
  { title: "Knowledge Base", href: "/lab/knowledge", icon: Globe },
  { title: "Teams", href: "/lab/teams", icon: Users },
];

const secondaryNav: NavSection[] = [
  {
    title: "Research",
    items: [
      { title: "My Nodes", href: "/lab/workspace/nodes", icon: FileText },
      { title: "Artifacts", href: "/lab/workspace/artifacts", icon: BookOpen },
      { title: "Analytics", href: "/lab/workspace/analytics", icon: BarChart3 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <TooltipProvider delayDuration={0}>
      <div
        className={cn(
          "relative flex flex-col h-full bg-sidebar border-r transition-all duration-300",
          isCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo & Brand */}
        <div className="flex items-center h-16 px-4 border-b">
          <Link href="/lab" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            {!isCollapsed && (
              <span className="font-semibold text-lg">NextGen LMS</span>
            )}
          </Link>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="px-3 py-3">
            <Button
              variant="outline"
              className="w-full justify-start text-muted-foreground"
              size="sm"
            >
              <Search className="w-4 h-4 mr-2" />
              Search...
              <kbd className="ml-auto text-xs bg-muted px-1.5 py-0.5 rounded">
                ⌘K
              </kbd>
            </Button>
          </div>
        )}

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="px-3 pb-2">
            <Button className="w-full gap-2" size="sm">
              <Plus className="w-4 h-4" />
              New Research Node
            </Button>
          </div>
        )}

        <Separator />

        {/* Main Navigation */}
        <ScrollArea className="flex-1 px-3 py-2">
          <nav className="space-y-1">
            {mainNav.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/lab" && pathname.startsWith(item.href));

              const navItem = (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                  )}
                >
                  <item.icon className="w-5 h-5 shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                  {!isCollapsed && item.badge && (
                    <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>{navItem}</TooltipTrigger>
                    <TooltipContent side="right">{item.title}</TooltipContent>
                  </Tooltip>
                );
              }

              return navItem;
            })}
          </nav>

          {/* Secondary Navigation */}
          {!isCollapsed &&
            secondaryNav.map((section) => (
              <div key={section.title} className="mt-6">
                <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  {section.title}
                </h3>
                <nav className="space-y-1">
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-accent-foreground"
                            : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
                        )}
                      >
                        <item.icon className="w-4 h-4 shrink-0" />
                        <span>{item.title}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
        </ScrollArea>

        <Separator />

        {/* User Section */}
        <div className="p-3">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent/50 cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                JD
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Jane Doe</p>
                <p className="text-xs text-muted-foreground truncate">
                  Level 12 • 3,450 XP
                </p>
              </div>
              <Award className="w-4 h-4 text-yellow-500" />
            </div>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium cursor-pointer">
                    JD
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>Jane Doe</p>
                <p className="text-xs text-muted-foreground">
                  Level 12 • 3,450 XP
                </p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-20 w-6 h-6 bg-background border rounded-full flex items-center justify-center shadow-sm hover:bg-accent transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </TooltipProvider>
  );
}
