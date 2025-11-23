import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import {
  Rocket,
  Brain,
  Users,
  Zap,
  BookOpen,
  GitBranch,
  Award,
} from "lucide-react";
import { LandingHeader } from "@/components/layout/landing-header";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <LandingHeader />
      <HeroSection />
      <FeaturesSection />
      <CTASection />
      <Footer />
    </div>
  );
}

function HeroSection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="container mx-auto px-4 py-24 text-center">
      <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-6">
        <Zap className="w-4 h-4" />
        Distributed Research Network
      </div>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
        {t("title")}
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
        {t("subtitle")}
      </p>
      <div className="flex items-center justify-center gap-4">
        <Link href="/(lab)">
          <Button size="lg" className="gap-2">
            <Rocket className="w-5 h-5" />
            {t("cta")}
          </Button>
        </Link>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const t = useTranslations("landing.features");

  const features = [
    {
      icon: <Brain className="w-6 h-6" />,
      titleKey: "challenges.title",
      descKey: "challenges.description",
    },
    {
      icon: <GitBranch className="w-6 h-6" />,
      titleKey: "knowledge.title",
      descKey: "knowledge.description",
    },
    {
      icon: <Users className="w-6 h-6" />,
      titleKey: "collaboration.title",
      descKey: "collaboration.description",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      titleKey: "ai.title",
      descKey: "ai.description",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16">
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <FeatureCard
            key={index}
            icon={feature.icon}
            title={t(feature.titleKey)}
            description={t(feature.descKey)}
          />
        ))}
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border rounded-lg p-6 hover:border-border transition-colors">
      <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center text-accent-foreground mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function CTASection() {
  const t = useTranslations("landing.hero");

  return (
    <section className="container mx-auto px-4 py-24">
      <div className="bg-primary rounded-lg p-12 text-center text-primary-foreground">
        <h2 className="text-3xl font-bold mb-4">
          Ready to Start Your Research Journey?
        </h2>
        <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
          Join thousands of learners who are transforming how they acquire
          knowledge through collaborative research.
        </p>
        <Link href="/(lab)">
          <Button size="lg" variant="secondary" className="gap-2">
            <Rocket className="w-5 h-5" />
            {t("cta")}
          </Button>
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-8">
      <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
        <p>NextGen LMS - Distributed Research & Learning Platform</p>
      </div>
    </footer>
  );
}
