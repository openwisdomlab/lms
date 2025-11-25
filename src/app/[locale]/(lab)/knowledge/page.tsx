"use client";

import React, { useState } from "react";
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
  List,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InteractiveKnowledgeGraph, type KnowledgeNode, type KnowledgeEdge } from "@/components/knowledge/interactive-knowledge-graph";
import { useRouter } from "@/i18n/navigation";

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

// Demo data for knowledge graph visualization
const demoGraphNodes: KnowledgeNode[] = [
  {
    id: "h1",
    title: "CRISPR can target multiple genes simultaneously",
    type: "hypothesis",
    summary: "Testing multiplexed gene editing efficiency",
    confidence: 0.85,
    forkCount: 12,
    citationCount: 45,
    isVerified: true,
    author: "Dr. Sarah Chen",
  },
  {
    id: "e1",
    title: "Multi-target CRISPR experiment",
    type: "experiment",
    summary: "Controlled lab experiment with HeLa cells",
    confidence: 0.9,
    forkCount: 8,
    author: "Sarah Chen Lab",
  },
  {
    id: "d1",
    title: "Gene editing efficiency dataset",
    type: "data",
    summary: "N=500 samples, 95% CI",
    forkCount: 23,
    citationCount: 67,
  },
  {
    id: "a1",
    title: "Statistical analysis of editing rates",
    type: "analysis",
    summary: "Bayesian analysis showing 87% success rate",
    confidence: 0.78,
  },
  {
    id: "l1",
    title: "Review: CRISPR Technology 2024",
    type: "literature",
    summary: "Comprehensive review of recent advances",
    citationCount: 156,
  },
  {
    id: "m1",
    title: "Optimized guide RNA design protocol",
    type: "methodology",
    summary: "Step-by-step protocol for sgRNA optimization",
    forkCount: 45,
  },
  {
    id: "h2",
    title: "Off-target effects are minimized with AI-designed guides",
    type: "hypothesis",
    summary: "AI optimization reduces off-target binding",
    confidence: 0.72,
    forkCount: 5,
  },
  {
    id: "s1",
    title: "Synthesis: CRISPR Best Practices",
    type: "synthesis",
    summary: "Combined findings from 23 studies",
    isVerified: true,
    citationCount: 89,
  },
  {
    id: "q1",
    title: "Can CRISPR edit mitochondrial DNA?",
    type: "question",
    summary: "Open research question",
  },
];

const demoGraphEdges: KnowledgeEdge[] = [
  { id: "e1-h1", source: "e1", target: "h1", type: "supports", strength: 0.9 },
  { id: "d1-e1", source: "d1", target: "e1", type: "derived_from" },
  { id: "a1-d1", source: "a1", target: "d1", type: "extends" },
  { id: "a1-h1", source: "a1", target: "h1", type: "supports", strength: 0.85 },
  { id: "l1-h1", source: "l1", target: "h1", type: "references" },
  { id: "m1-e1", source: "m1", target: "e1", type: "prerequisite" },
  { id: "h2-h1", source: "h2", target: "h1", type: "extends" },
  { id: "s1-h1", source: "s1", target: "h1", type: "cites" },
  { id: "s1-a1", source: "s1", target: "a1", type: "cites" },
  { id: "q1-h1", source: "q1", target: "h1", type: "related" },
  { id: "m1-h2", source: "m1", target: "h2", type: "supports", strength: 0.7 },
];

export default function KnowledgeBasePage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<"list" | "graph">("list");

  const handleNodeClick = (node: KnowledgeNode) => {
    console.log("Node clicked:", node);
  };

  const handleNodeDoubleClick = (node: KnowledgeNode) => {
    router.push(`/(lab)/research/${node.id}`);
  };

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
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none gap-2"
            >
              <List className="w-4 h-4" />
              List
            </Button>
            <Button
              variant={viewMode === "graph" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("graph")}
              className="rounded-none gap-2"
            >
              <Network className="w-4 h-4" />
              Graph
            </Button>
          </div>
        </div>
      </div>

      {/* Graph View */}
      {viewMode === "graph" && (
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Network className="w-5 h-5" />
              Knowledge Graph Explorer
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Visualize connections between hypotheses, experiments, and evidence. Click nodes to select, double-click to open.
            </p>
          </CardHeader>
          <CardContent className="p-0">
            <InteractiveKnowledgeGraph
              nodes={demoGraphNodes}
              edges={demoGraphEdges}
              currentNodeId="h1"
              onNodeClick={handleNodeClick}
              onNodeDoubleClick={handleNodeDoubleClick}
              height="650px"
              showMinimap={true}
              showControls={true}
            />
          </CardContent>
        </Card>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <>
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
        </>
      )}
    </div>
  );
}
