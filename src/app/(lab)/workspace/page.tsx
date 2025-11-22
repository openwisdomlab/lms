"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Plus,
  FileText,
  FlaskConical,
  Database,
  Search,
  LayoutGrid,
  List,
  MoreHorizontal,
  Clock,
  GitFork,
  Eye,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScienceEditor } from "@/components/editor";

// Mock data for research nodes
const researchNodes = [
  {
    id: "1",
    title: "Perchlorate Reduction Hypothesis",
    type: "hypothesis",
    content: "Investigating microbial pathways for perchlorate reduction...",
    updatedAt: "2 hours ago",
    views: 42,
    forks: 3,
    isPublic: true,
  },
  {
    id: "2",
    title: "Spectroscopy Analysis Results",
    type: "analysis",
    content: "UV-Vis spectroscopy data from soil samples shows...",
    updatedAt: "1 day ago",
    views: 28,
    forks: 1,
    isPublic: false,
  },
  {
    id: "3",
    title: "Mars Geology Literature Review",
    type: "literature",
    content: "Comprehensive review of geological studies...",
    updatedAt: "3 days ago",
    views: 156,
    forks: 12,
    isPublic: true,
  },
  {
    id: "4",
    title: "Soil Sample Dataset v2",
    type: "data",
    content: "Updated dataset with 500 additional samples...",
    updatedAt: "5 days ago",
    views: 89,
    forks: 7,
    isPublic: true,
  },
];

const nodeTypeIcons: Record<string, React.ElementType> = {
  hypothesis: Sparkles,
  analysis: FlaskConical,
  literature: FileText,
  data: Database,
  experiment: FlaskConical,
  synthesis: FileText,
  note: FileText,
  question: Sparkles,
};

const nodeTypeColors: Record<string, string> = {
  hypothesis: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  analysis: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  literature: "bg-green-500/10 text-green-600 dark:text-green-400",
  data: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  experiment: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  synthesis: "bg-pink-500/10 text-pink-600 dark:text-pink-400",
  note: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  question: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
};

export default function WorkspacePage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showEditor, setShowEditor] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Workspace</h1>
          <p className="text-muted-foreground">
            Your research nodes and artifacts
          </p>
        </div>
        <Button className="gap-2" onClick={() => setShowEditor(!showEditor)}>
          <Plus className="w-4 h-4" />
          New Research Node
        </Button>
      </div>

      {/* Quick Editor Panel */}
      {showEditor && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Input
                placeholder="Untitled Research Node"
                className="text-lg font-semibold border-none shadow-none p-0 h-auto focus-visible:ring-0"
              />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowEditor(false)}>
                  Cancel
                </Button>
                <Button size="sm">Save Node</Button>
              </div>
            </div>
            <ScienceEditor
              placeholder="Start writing your research... Use '/' for commands or '@' to cite other nodes."
              className="min-h-[300px]"
            />
          </CardContent>
        </Card>
      )}

      {/* Tabs & Controls */}
      <Tabs defaultValue="all">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">All Nodes</TabsTrigger>
            <TabsTrigger value="hypothesis">Hypotheses</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search nodes..."
                className="pl-9 w-[200px]"
              />
            </div>
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-r-none"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="rounded-l-none"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <TabsContent value="all" className="mt-0">
          {viewMode === "grid" ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {researchNodes.map((node) => {
                const Icon = nodeTypeIcons[node.type] || FileText;
                return (
                  <Link key={node.id} href={`/lab/workspace/nodes/${node.id}`}>
                    <Card className="hover:shadow-md transition-all hover:border-primary/50 cursor-pointer h-full">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Badge className={nodeTypeColors[node.type]}>
                            <Icon className="w-3 h-3 mr-1" />
                            {node.type}
                          </Badge>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => e.preventDefault()}
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              <DropdownMenuItem>Share</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-destructive">
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h3 className="font-semibold mb-2 line-clamp-1">
                          {node.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {node.content}
                        </p>

                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {node.updatedAt}
                          </span>
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {node.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <GitFork className="w-3 h-3" />
                              {node.forks}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {researchNodes.map((node) => {
                const Icon = nodeTypeIcons[node.type] || FileText;
                return (
                  <Link key={node.id} href={`/lab/workspace/nodes/${node.id}`}>
                    <Card className="hover:shadow-sm transition-all hover:border-primary/50 cursor-pointer">
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          <Icon className="w-5 h-5 text-muted-foreground" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">
                            {node.title}
                          </h3>
                          <p className="text-sm text-muted-foreground truncate">
                            {node.content}
                          </p>
                        </div>

                        <Badge className={nodeTypeColors[node.type]}>
                          {node.type}
                        </Badge>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {node.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <GitFork className="w-4 h-4" />
                            {node.forks}
                          </span>
                          <span className="flex items-center gap-1 w-24">
                            <Clock className="w-4 h-4" />
                            {node.updatedAt}
                          </span>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => e.preventDefault()}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Duplicate</DropdownMenuItem>
                            <DropdownMenuItem>Share</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="hypothesis">
          <div className="text-center py-12 text-muted-foreground">
            <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Filter showing hypotheses only</p>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="text-center py-12 text-muted-foreground">
            <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Filter showing data nodes only</p>
          </div>
        </TabsContent>

        <TabsContent value="analysis">
          <div className="text-center py-12 text-muted-foreground">
            <FlaskConical className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Filter showing analysis nodes only</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
