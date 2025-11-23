"use client";

import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeSwitcher } from "./theme-switcher";

export function LandingHeader() {
  const t = useTranslations("landing.hero");
  const navT = useTranslations("nav");

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-foreground flex items-center justify-center">
            <Rocket className="w-5 h-5 text-background" />
          </div>
          <span className="font-semibold text-lg tracking-tight">NextGen LMS</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* Theme & Language */}
          <ThemeSwitcher />
          <LanguageSwitcher />

          {/* CTA */}
          <div className="hidden sm:flex items-center gap-2 ml-2">
            <Link href="/(lab)">
              <Button variant="ghost" size="sm">
                {navT("missionControl")}
              </Button>
            </Link>
            <Button size="sm">{t("cta")}</Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
