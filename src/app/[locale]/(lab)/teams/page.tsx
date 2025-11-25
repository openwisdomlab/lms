import React from "react";
import { Link } from "@/i18n/navigation";
import {
  Users,
  Plus,
  Search,
  Trophy,
  Target,
  MessageSquare,
  Crown,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock team data
const myTeams = [
  {
    id: "1",
    name: "Mars Colony Initiative",
    slug: "mars-colony",
    description: "Researching sustainable life support systems for Mars",
    members: [
      { name: "Jane Doe", role: "lead", avatar: null },
      { name: "John Smith", role: "member", avatar: null },
      { name: "Alice Chen", role: "member", avatar: null },
      { name: "Bob Wilson", role: "member", avatar: null },
    ],
    challenge: "Mars Soil Composition Analysis",
    totalXP: 12500,
    activeNodes: 24,
  },
  {
    id: "2",
    name: "Quantum Computing Lab",
    slug: "quantum-lab",
    description: "Exploring quantum error correction methods",
    members: [
      { name: "Dr. Smith", role: "lead", avatar: null },
      { name: "Jane Doe", role: "member", avatar: null },
    ],
    challenge: "Quantum Error Correction",
    totalXP: 8900,
    activeNodes: 15,
  },
];

const discoverTeams = [
  {
    id: "3",
    name: "BioTech Pioneers",
    description: "CRISPR and gene therapy research",
    members: 12,
    focus: "Genetics",
    isOpen: true,
    totalXP: 45000,
  },
  {
    id: "4",
    name: "Climate Warriors",
    description: "Developing climate change mitigation strategies",
    members: 28,
    focus: "Environmental Science",
    isOpen: true,
    totalXP: 67000,
  },
  {
    id: "5",
    name: "Neural Networks United",
    description: "AI for medical diagnostics",
    members: 15,
    focus: "AI/ML",
    isOpen: false,
    totalXP: 52000,
  },
];

const leaderboard = [
  { rank: 1, name: "Space Explorers", xp: 125000, members: 45 },
  { rank: 2, name: "BioHackers", xp: 98000, members: 32 },
  { rank: 3, name: "Quantum Pioneers", xp: 87000, members: 18 },
  { rank: 4, name: "Climate Warriors", xp: 67000, members: 28 },
  { rank: 5, name: "Neural Networks United", xp: 52000, members: 15 },
];

export default function TeamsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Research Teams</h1>
          <p className="text-muted-foreground">
            Collaborate with other researchers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search teams..." className="pl-9 w-[200px]" />
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create Team
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="my-teams">
        <TabsList>
          <TabsTrigger value="my-teams">My Teams</TabsTrigger>
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        <TabsContent value="my-teams" className="mt-4">
          {myTeams.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="font-medium mb-2">No teams yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Join or create a team to collaborate with other researchers
                </p>
                <Button>Create Your First Team</Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myTeams.map((team) => (
                <Card key={team.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{team.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {team.description}
                        </p>
                      </div>
                      {team.members[0].role === "lead" && (
                        <Badge variant="outline" className="gap-1">
                          <Crown className="w-3 h-3" />
                          Lead
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Challenge */}
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Challenge:</span>
                      <span className="font-medium">{team.challenge}</span>
                    </div>

                    {/* Members */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 4).map((member, i) => (
                          <Avatar
                            key={i}
                            className="w-8 h-8 border-2 border-background"
                          >
                            <AvatarImage src={member.avatar || undefined} />
                            <AvatarFallback className="text-xs">
                              {member.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                        {team.members.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                            +{team.members.length - 4}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {team.members.length} members
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-4 h-4 text-green-500" />
                          {team.totalXP.toLocaleString()} XP
                        </span>
                        <span className="text-muted-foreground">
                          {team.activeNodes} nodes
                        </span>
                      </div>
                      <Link href="/(lab)/teams">
                        <Button size="sm" variant="outline">
                          View Team
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="discover" className="mt-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {discoverTeams.map((team) => (
              <Card key={team.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant="secondary">{team.focus}</Badge>
                    <Badge variant={team.isOpen ? "success" : "outline"}>
                      {team.isOpen ? "Open" : "Invite Only"}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-1">{team.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {team.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {team.members} members
                    </span>
                    <span className="flex items-center gap-1">
                      <Trophy className="w-4 h-4 text-yellow-500" />
                      {team.totalXP.toLocaleString()} XP
                    </span>
                  </div>

                  <Button className="w-full mt-4" variant="outline">
                    {team.isOpen ? "Join Team" : "Request to Join"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Top Research Teams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {leaderboard.map((team, index) => (
                  <div
                    key={team.rank}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        index === 0
                          ? "bg-yellow-500 text-white"
                          : index === 1
                          ? "bg-gray-400 text-white"
                          : index === 2
                          ? "bg-amber-600 text-white"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {team.rank}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{team.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {team.members} members
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {team.xp.toLocaleString()} XP
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
