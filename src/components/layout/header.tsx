"use client";

import React from "react";
import { usePathname } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
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
import { LanguageSwitcher } from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";
import { Separator } from "@/components/ui/separator";

export function Header() {
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("nav");

  // Path titles mapping with i18n support
  const getPathTitle = (path: string): string => {
    const pathMap: Record<string, string> = {
      "": t("missionControl"),
      "missions": t("missions"),
      "workspace": t("workspace"),
      "knowledge": t("knowledge"),
      "teams": t("teams"),
      "events": t("events"),
      "learn": t("learn"),
    };
    return pathMap[path] || path.charAt(0).toUpperCase() + path.slice(1);
  };

  // Generate breadcrumbs - skip locale segment
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    return {
      title: getPathTitle(segment),
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

            {/* Separator */}
            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Theme Switcher */}
            <ThemeSwitcher />

            {/* Language Switcher */}
            <LanguageSwitcher />
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
}
