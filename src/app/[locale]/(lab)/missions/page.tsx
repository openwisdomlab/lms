import React from "react";
import { Link } from "@/i18n/navigation";
import {
  Target,
  Clock,
  Award,
  Users,
  TrendingUp,
  Filter,
  Search,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

// Mock challenge data
const challenges = [
  {
    id: "mars-soil",
    title: "Mars Soil Composition Analysis",
    description:
      "Analyze Martian soil samples to identify essential nutrients and propose methods for sustainable agriculture.",
    difficulty: "advanced",
    field: ["Astrobiology", "Chemistry"],
    xpReward: 500,
    estimatedHours: 20,
    participants: 234,
    isFeatured: true,
    progress: 65,
    status: "in_progress",
  },
  {
    id: "quantum-computing",
    title: "Quantum Error Correction",
    description:
      "Design and simulate novel error correction codes for near-term quantum computers.",
    difficulty: "expert",
    field: ["Quantum Computing", "Physics"],
    xpReward: 750,
    estimatedHours: 40,
    participants: 89,
    isFeatured: true,
    progress: 0,
    status: "not_started",
  },
  {
    id: "ocean-plastic",
    title: "Ocean Plastic Decomposition",
    description:
      "Research enzymatic approaches to accelerating plastic breakdown in marine environments.",
    difficulty: "intermediate",
    field: ["Environmental Science", "Biology"],
    xpReward: 400,
    estimatedHours: 15,
    participants: 567,
    isFeatured: false,
    progress: 0,
    status: "not_started",
  },
  {
    id: "neural-interfaces",
    title: "Brain-Computer Interface Protocols",
    description:
      "Develop standardized protocols for non-invasive neural signal processing.",
    difficulty: "frontier",
    field: ["Neuroscience", "Biomedical Engineering"],
    xpReward: 1000,
    estimatedHours: 60,
    participants: 45,
    isFeatured: true,
    progress: 0,
    status: "not_started",
  },
  {
    id: "fusion-materials",
    title: "Fusion Reactor Wall Materials",
    description:
      "Evaluate candidate materials for plasma-facing components in fusion reactors.",
    difficulty: "advanced",
    field: ["Materials Science", "Nuclear Physics"],
    xpReward: 600,
    estimatedHours: 30,
    participants: 123,
    isFeatured: false,
    progress: 0,
    status: "not_started",
  },
];

const difficultyColors: Record<string, string> = {
  beginner: "bg-green-500/10 text-green-600 dark:text-green-400",
  intermediate: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  advanced: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  expert: "bg-red-500/10 text-red-600 dark:text-red-400",
  frontier: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export default function MissionsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Challenge Hub</h1>
          <p className="text-muted-foreground">
            Tackle frontier research problems and earn XP
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search challenges..."
              className="pl-9 w-[250px]"
            />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Difficulty Filter Badges */}
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="cursor-pointer hover:bg-accent">
          All Levels
        </Badge>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-accent bg-green-500/10 text-green-600"
        >
          Beginner
        </Badge>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-accent bg-blue-500/10 text-blue-600"
        >
          Intermediate
        </Badge>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-accent bg-orange-500/10 text-orange-600"
        >
          Advanced
        </Badge>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-accent bg-red-500/10 text-red-600"
        >
          Expert
        </Badge>
        <Badge
          variant="outline"
          className="cursor-pointer hover:bg-accent bg-purple-500/10 text-purple-600"
        >
          Frontier
        </Badge>
      </div>

      {/* Active Challenge (if any) */}
      {challenges.some((c) => c.status === "in_progress") && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <CardTitle className="text-lg">Continue Your Challenge</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {challenges
              .filter((c) => c.status === "in_progress")
              .map((challenge) => (
                <Link
                  key={challenge.id}
                  href={`/(lab)/missions`}
                  className="flex items-center justify-between"
                >
                  <div className="space-y-2 flex-1">
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <Progress value={challenge.progress} className="h-2 w-64" />
                    <p className="text-sm text-muted-foreground">
                      {challenge.progress}% complete
                    </p>
                  </div>
                  <Button>Continue</Button>
                </Link>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Challenge Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {challenges.map((challenge) => (
          <Card
            key={challenge.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {challenge.isFeatured && (
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  )}
                  <Badge className={difficultyColors[challenge.difficulty]}>
                    {challenge.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Award className="w-4 h-4 text-yellow-500" />
                  {challenge.xpReward} XP
                </div>
              </div>

              <h3 className="font-semibold text-lg mb-2">{challenge.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {challenge.description}
              </p>

              <div className="flex flex-wrap gap-1 mb-4">
                {challenge.field.map((f) => (
                  <Badge key={f} variant="secondary" className="text-xs">
                    {f}
                  </Badge>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {challenge.estimatedHours}h
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {challenge.participants}
                  </span>
                </div>
                <Link href="/(lab)/missions">
                  <Button size="sm" variant="outline">
                    {challenge.status === "in_progress"
                      ? "Continue"
                      : "Start Challenge"}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
