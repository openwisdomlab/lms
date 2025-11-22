"use client";

import React from "react";
import { usePathname } from "next/navigation";
import {
  Bell,
  Settings,
  HelpCircle,
  ChevronRight,
  Flame,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const pathTitles: Record<string, string> = {
  "/lab": "Mission Control",
  "/lab/missions": "Challenges",
  "/lab/workspace": "My Workspace",
  "/lab/knowledge": "Knowledge Base",
  "/lab/teams": "Teams",
  "/lab/workspace/nodes": "Research Nodes",
  "/lab/workspace/artifacts": "Artifacts",
  "/lab/workspace/analytics": "Analytics",
};

export function Header() {
  const pathname = usePathname();

  // Generate breadcrumbs
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    return {
      title: pathTitles[href] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href,
      isLast: index === pathSegments.length - 1,
    };
  });

  return (
    <TooltipProvider>
      <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-1 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && (
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                )}
                <span
                  className={
                    crumb.isLast
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground transition-colors"
                  }
                >
                  {crumb.title}
                </span>
              </React.Fragment>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Streak Indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400">
              <Flame className="w-4 h-4" />
              <span className="text-sm font-medium">7 day streak</span>
            </div>

            {/* AI Assistant Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Sparkles className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-violet-500 rounded-full" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>AI Research Assistant</TooltipContent>
            </Tooltip>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-[10px]"
                  >
                    3
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                  <span className="font-medium">New badge earned!</span>
                  <span className="text-xs text-muted-foreground">
                    You earned the &ldquo;Week Warrior&rdquo; badge
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                  <span className="font-medium">Team invitation</span>
                  <span className="text-xs text-muted-foreground">
                    You&apos;ve been invited to join &ldquo;Mars Colony Team&rdquo;
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 cursor-pointer">
                  <span className="font-medium">Citation received</span>
                  <span className="text-xs text-muted-foreground">
                    Your hypothesis was cited by 3 researchers
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-center text-sm text-primary cursor-pointer">
                  View all notifications
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Help */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <HelpCircle className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Help & Resources</TooltipContent>
            </Tooltip>

            {/* Settings */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Settings className="w-5 h-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Settings</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
