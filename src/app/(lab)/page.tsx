import React from "react";
import Link from "next/link";
import {
  Target,
  FlaskConical,
  TrendingUp,
  Award,
  Clock,
  ArrowRight,
  Flame,
  GitFork,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

// Mock data for dashboard
const activeChallenge = {
  title: "Mars Soil Composition Analysis",
  progress: 65,
  dueIn: "3 days",
  xpReward: 500,
};

const recentNodes = [
  {
    id: "1",
    title: "Perchlorate Hypothesis",
    type: "hypothesis",
    views: 42,
    forks: 3,
    updatedAt: "2 hours ago",
  },
  {
    id: "2",
    title: "Spectroscopy Data Analysis",
    type: "analysis",
    views: 28,
    forks: 1,
    updatedAt: "1 day ago",
  },
  {
    id: "3",
    title: "Literature Review: Mars Geology",
    type: "literature",
    views: 156,
    forks: 12,
    updatedAt: "3 days ago",
  },
];

const upcomingBadges = [
  { name: "Data Pioneer", progress: 80, requirement: "Submit 5 datasets" },
  { name: "Peer Reviewer", progress: 60, requirement: "Complete 5 reviews" },
];

const stats = [
  { label: "Total XP", value: "3,450", icon: TrendingUp, change: "+120 today" },
  { label: "Research Nodes", value: "24", icon: FlaskConical, change: "+2 this week" },
  { label: "Citations", value: "18", icon: GitFork, change: "+5 this month" },
  { label: "Badges", value: "8", icon: Award, change: "2 in progress" },
];

export default function MissionControlPage() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, Jane</h1>
          <p className="text-muted-foreground">
            You&apos;re on a{" "}
            <span className="text-orange-500 font-medium inline-flex items-center gap-1">
              <Flame className="w-4 h-4" /> 7 day streak
            </span>
            ! Keep up the great work.
          </p>
        </div>
        <Button className="gap-2">
          <Target className="w-4 h-4" />
          Find New Challenge
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Challenge */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Active Challenge</CardTitle>
              <Badge variant="info" className="gap-1">
                <Clock className="w-3 h-3" />
                {activeChallenge.dueIn} left
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-1">
                  {activeChallenge.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Analyze the composition of Martian soil samples and propose
                  methods for resource extraction.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{activeChallenge.progress}%</span>
                </div>
                <Progress value={activeChallenge.progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-yellow-500" />
                  <span>{activeChallenge.xpReward} XP on completion</span>
                </div>
                <Link href="/lab/missions/mars-soil">
                  <Button size="sm" className="gap-1">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Badge Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Badge Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingBadges.map((badge) => (
              <div key={badge.name} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span className="font-medium text-sm">{badge.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {badge.progress}%
                  </span>
                </div>
                <Progress value={badge.progress} className="h-1.5" />
                <p className="text-xs text-muted-foreground">
                  {badge.requirement}
                </p>
              </div>
            ))}
            <Link href="/lab/workspace/badges">
              <Button variant="ghost" size="sm" className="w-full mt-2">
                View All Badges
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Recent Research Nodes */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Recent Research Nodes</CardTitle>
            <Link href="/lab/workspace/nodes">
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentNodes.map((node) => (
              <Link
                key={node.id}
                href={`/lab/workspace/nodes/${node.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <FlaskConical className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-medium">{node.title}</h4>
                    <p className="text-xs text-muted-foreground">
                      {node.type} • Updated {node.updatedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {node.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <GitFork className="w-4 h-4" />
                    {node.forks}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
