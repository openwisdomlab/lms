import React from "react";
import {
  Globe,
  Search,
  Filter,
  TrendingUp,
  Clock,
  Eye,
  GitFork,
  FileText,
  Network,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock data for public knowledge base
const trendingNodes = [
  {
    id: "1",
    title: "CRISPR Gene Editing: A Comprehensive Guide",
    type: "synthesis",
    author: "Dr. Sarah Chen",
    views: 2340,
    forks: 89,
    citations: 156,
    field: ["Biology", "Genetics"],
  },
  {
    id: "2",
    title: "Machine Learning in Climate Modeling",
    type: "analysis",
    author: "Prof. James Wilson",
    views: 1890,
    forks: 67,
    citations: 98,
    field: ["AI/ML", "Climate Science"],
  },
  {
    id: "3",
    title: "Quantum Entanglement Protocols",
    type: "hypothesis",
    author: "Dr. Maria Garcia",
    views: 1560,
    forks: 45,
    citations: 72,
    field: ["Quantum Physics"],
  },
  {
    id: "4",
    title: "Sustainable Energy Storage Solutions",
    type: "literature",
    author: "Research Team Alpha",
    views: 1230,
    forks: 34,
    citations: 56,
    field: ["Energy", "Materials Science"],
  },
];

const recentlyPublished = [
  {
    id: "5",
    title: "Neural Network Architecture for Protein Folding",
    type: "analysis",
    author: "Emily Johnson",
    publishedAt: "2 hours ago",
    field: ["Bioinformatics"],
  },
  {
    id: "6",
    title: "Mars Atmospheric Data Collection Methods",
    type: "experiment",
    author: "Space Research Lab",
    publishedAt: "5 hours ago",
    field: ["Astrobiology"],
  },
  {
    id: "7",
    title: "Ocean Acidification Impact Study",
    type: "data",
    author: "Marine Biology Dept",
    publishedAt: "1 day ago",
    field: ["Environmental Science"],
  },
];

const categories = [
  { name: "Physics", count: 1234, icon: "⚛️" },
  { name: "Biology", count: 987, icon: "🧬" },
  { name: "Chemistry", count: 756, icon: "🧪" },
  { name: "Computer Science", count: 1567, icon: "💻" },
  { name: "Environmental Science", count: 543, icon: "🌍" },
  { name: "Mathematics", count: 432, icon: "📐" },
  { name: "Astronomy", count: 321, icon: "🔭" },
  { name: "Medicine", count: 876, icon: "⚕️" },
];

export default function KnowledgeBasePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Global Knowledge Base</h1>
          <p className="text-muted-foreground">
            Explore research from the community
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search the knowledge base..." className="pl-9" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
          <Button className="gap-2">
            <Network className="w-4 h-4" />
            Graph View
          </Button>
        </div>
      </div>

      {/* Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        {categories.map((category) => (
          <Card
            key={category.name}
            className="cursor-pointer hover:shadow-md hover:border-primary/50 transition-all"
          >
            <CardContent className="p-3 text-center">
              <span className="text-2xl mb-1 block">{category.icon}</span>
              <p className="font-medium text-sm truncate">{category.name}</p>
              <p className="text-xs text-muted-foreground">
                {category.count.toLocaleString()} nodes
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="trending">
        <TabsList>
          <TabsTrigger value="trending" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Trending
          </TabsTrigger>
          <TabsTrigger value="recent" className="gap-2">
            <Clock className="w-4 h-4" />
            Recent
          </TabsTrigger>
          <TabsTrigger value="following" className="gap-2">
            <Sparkles className="w-4 h-4" />
            For You
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trending" className="mt-4">
          <div className="grid lg:grid-cols-2 gap-4">
            {trendingNodes.map((node, index) => (
              <Card
                key={node.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {node.field.map((f) => (
                          <Badge key={f} variant="secondary" className="text-xs">
                            {f}
                          </Badge>
                        ))}
                      </div>
                      <h3 className="font-semibold mb-1">{node.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        by {node.author}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {node.views.toLocaleString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" />
                          {node.forks}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {node.citations} citations
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <div className="space-y-3">
            {recentlyPublished.map((node) => (
              <Card
                key={node.id}
                className="hover:shadow-sm transition-shadow cursor-pointer"
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Globe className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{node.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {node.author} • {node.publishedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {node.field.map((f) => (
                      <Badge key={f} variant="outline" className="text-xs">
                        {f}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="following" className="mt-4">
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="font-medium mb-2">Personalized Feed</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Based on your research interests and activity, we&apos;ll show you
              relevant content from researchers you follow and topics you care
              about.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
