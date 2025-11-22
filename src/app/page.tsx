import Link from "next/link";
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

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Navigation */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Rocket className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg">NextGen LMS</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/lab">
              <Button variant="ghost">Enter Lab</Button>
            </Link>
            <Button>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
          <Zap className="w-4 h-4" />
          Distributed Research Network
        </div>
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 max-w-4xl mx-auto">
          Where <span className="text-primary">Learning</span> Meets{" "}
          <span className="text-primary">Research</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
          A next-generation learning experience platform that transforms
          students into researchers through challenge-based learning and
          collaborative knowledge building.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link href="/lab">
            <Button size="lg" className="gap-2">
              <Rocket className="w-5 h-5" />
              Launch Your Lab
            </Button>
          </Link>
          <Button size="lg" variant="outline">
            Explore Challenges
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Brain className="w-6 h-6" />}
            title="Challenge-Based Learning"
            description="Start with real-world problems like 'How do we survive on Mars?' and work backwards to master the underlying concepts."
          />
          <FeatureCard
            icon={<GitBranch className="w-6 h-6" />}
            title="Knowledge Graph"
            description="All learning outputs connect in a bidirectional knowledge graph. Fork, remix, and build upon others' research."
          />
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Research Teams"
            description="Form teams as junior researchers. Collaborate on hypotheses, share data, and peer-review discoveries."
          />
          <FeatureCard
            icon={<BookOpen className="w-6 h-6" />}
            title="Notion-like Editor"
            description="A powerful block-based editor with LaTeX math, code blocks, citations, and AI-assisted writing."
          />
          <FeatureCard
            icon={<Award className="w-6 h-6" />}
            title="Gamification & XP"
            description="Earn XP, unlock badges like 'Data Scientist' or 'Peer Reviewer', and maintain research streaks."
          />
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="AI Research Assistant"
            description="Built-in AI co-pilot to evaluate hypotheses, suggest related research, and help synthesize findings."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-24">
        <div className="bg-primary rounded-2xl p-12 text-center text-primary-foreground">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Your Research Journey?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of learners who are transforming how they acquire
            knowledge through collaborative research.
          </p>
          <Link href="/lab">
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
            >
              <Rocket className="w-5 h-5" />
              Enter the Lab
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>NextGen LMS - Distributed Research & Learning Platform</p>
        </div>
      </footer>
    </div>
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
    <div className="bg-card border rounded-xl p-6 hover:shadow-lg transition-shadow">
      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-lg mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
