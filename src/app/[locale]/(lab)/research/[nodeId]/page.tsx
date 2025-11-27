"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  GitFork,
  History,
  Share2,
  MoreHorizontal,
  Save,
  Eye,
  Network,
  Sparkles,
  ChevronRight,
  Clock,
  User,
  GitBranch,
  CheckCircle,
  AlertTriangle,
  ExternalLink,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScienceEditor } from "@/components/editor";
import { KnowledgeGraphMini } from "@/components/research/knowledge-graph-mini";
import { VersionHistory } from "@/components/research/version-history";
import { CopilotPanel } from "@/components/research/copilot-panel";
import { useResearchCopilot } from "@/hooks/use-research-copilot";

// Mock data for the research node
const mockNode = {
  id: "node-1",
  title: "Mars Soil Perchlorate Reduction Hypothesis",
  slug: "mars-perchlorate-hypothesis",
  node_type: "hypothesis" as const,
  content: {
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Research Question" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Can microbial perchlorate reduction pathways be adapted for Mars soil remediation to enable sustainable agriculture?",
          },
        ],
      },
      {
        type: "hypothesisBlock",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "If perchlorate-reducing bacteria (PRB) are introduced to Martian regolith under controlled conditions with adequate electron donors, then perchlorate concentrations will decrease to levels safe for plant growth within 30 days.",
              },
            ],
          },
        ],
      },
    ],
  },
  summary:
    "Investigating microbial pathways for perchlorate reduction in Martian soil",
  hypothesis:
    "Perchlorate-reducing bacteria can remediate Martian soil for agriculture",
  methodology: "Controlled lab experiments with Mars simulant soil",
  is_public: true,
  is_verified: false,
  version: 3,
  fork_count: 5,
  view_count: 234,
  citation_count: 12,
  created_by: "user-1",
  created_at: "2024-01-15T10:30:00Z",
  updated_at: "2024-03-20T14:22:00Z",
};

const mockVersions = [
  {
    id: "v3",
    version_number: 3,
    change_message: "Added experimental results from Phase 1",
    change_type: "major",
    created_at: "2024-03-20T14:22:00Z",
    created_by: { display_name: "Jane Doe" },
  },
  {
    id: "v2",
    version_number: 2,
    change_message: "Refined hypothesis based on peer feedback",
    change_type: "minor",
    created_at: "2024-02-10T09:15:00Z",
    created_by: { display_name: "Jane Doe" },
  },
  {
    id: "v1",
    version_number: 1,
    change_message: "Initial hypothesis draft",
    change_type: "major",
    created_at: "2024-01-15T10:30:00Z",
    created_by: { display_name: "Jane Doe" },
  },
];

const mockGraphData = {
  nodes: [
    { id: "node-1", title: "Mars Perchlorate Hypothesis", type: "hypothesis", isCurrent: true },
    { id: "node-2", title: "PRB Literature Review", type: "literature" },
    { id: "node-3", title: "Mars Soil Composition Data", type: "data" },
    { id: "node-4", title: "Conflicting Theory", type: "hypothesis" },
    { id: "node-5", title: "Experimental Protocol", type: "methodology" },
  ],
  edges: [
    { source: "node-2", target: "node-1", type: "supports" },
    { source: "node-3", target: "node-1", type: "references" },
    { source: "node-4", target: "node-1", type: "contradicts" },
    { source: "node-5", target: "node-1", type: "methodology_from" },
  ],
};

export default function ResearchNodePage() {
  const params = useParams();
  const nodeId = params.nodeId as string;

  const [content, setContent] = useState(mockNode.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showGraphPanel, setShowGraphPanel] = useState(true);
  const [showCopilot, setShowCopilot] = useState(false);

  const copilot = useResearchCopilot({ autoAnalyze: true });
  const { updateContext } = copilot;

  // Update copilot context when content changes
  useEffect(() => {
    const textContent = JSON.stringify(content);
    updateContext({
      nodeId,
      nodeType: mockNode.node_type,
      content: textContent,
      hypothesis: mockNode.hypothesis,
    });
  }, [content, nodeId, updateContext]);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const handleFork = () => {
    // Fork logic
    console.log("Forking node...");
  };

  const handlePublish = () => {
    // Publish/submit for review logic
    console.log("Publishing...");
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="bg-violet-500/10 text-violet-600 border-violet-500/30"
              >
                {mockNode.node_type}
              </Badge>
              <h1 className="text-xl font-semibold">{mockNode.title}</h1>
              {mockNode.is_verified && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
            </div>

            <div className="flex items-center gap-2">
              {/* Copilot Suggestions Badge */}
              {copilot.suggestions.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 text-amber-600 border-amber-500/30"
                  onClick={() => setShowCopilot(true)}
                >
                  <AlertTriangle className="w-4 h-4" />
                  {copilot.suggestions.length} suggestions
                </Button>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowVersionHistory(!showVersionHistory)}
              >
                <History className="w-4 h-4 mr-2" />
                v{mockNode.version}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowGraphPanel(!showGraphPanel)}
              >
                <Network className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCopilot(!showCopilot)}
              >
                <Sparkles className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={handleFork}>
                <GitFork className="w-4 h-4 mr-2" />
                Fork ({mockNode.fork_count})
              </Button>

              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? "Saving..." : "Save"}
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handlePublish}>
                    <Share2 className="w-4 h-4 mr-2" />
                    Submit for Review
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <GitBranch className="w-4 h-4 mr-2" />
                    Create Branch
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Meta info */}
          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Jane Doe
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Updated 2 days ago
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {mockNode.view_count} views
            </span>
            <span className="flex items-center gap-1">
              <GitFork className="w-4 h-4" />
              {mockNode.fork_count} forks
            </span>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <div className="max-w-4xl mx-auto py-8 px-6">
            <ScienceEditor
              content={content}
              onChange={(newContent) => setContent(newContent as typeof content)}
              onCitationSearch={async (query) => {
                // Search knowledge base for citations
                return [
                  { id: "1", title: "PRB Study 2023", type: "literature", author: "Dr. Smith" },
                  { id: "2", title: "Mars Soil Analysis", type: "data", author: "NASA" },
                ];
              }}
              placeholder="Start writing your research... Use '/' for scientific blocks or '@' to cite other research."
              className="min-h-[500px]"
            />
          </div>
        </div>
      </div>

      {/* Right Panels */}
      <div className="flex">
        {/* Version History Panel */}
        {showVersionHistory && (
          <div className="w-72 border-l bg-muted/30">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Version History</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowVersionHistory(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <ScrollArea className="h-[calc(100vh-8rem)]">
              <VersionHistory
                versions={mockVersions}
                currentVersion={3}
                onRestore={(versionId) => console.log("Restore:", versionId)}
                onCompare={(versionId) => console.log("Compare:", versionId)}
              />
            </ScrollArea>
          </div>
        )}

        {/* Knowledge Graph Panel */}
        {showGraphPanel && (
          <div className="w-80 border-l bg-muted/30">
            <Tabs defaultValue="graph" className="h-full flex flex-col">
              <div className="px-4 pt-4">
                <TabsList className="w-full">
                  <TabsTrigger value="graph" className="flex-1">
                    Graph
                  </TabsTrigger>
                  <TabsTrigger value="links" className="flex-1">
                    Links
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="graph" className="flex-1 p-4">
                <KnowledgeGraphMini
                  nodes={mockGraphData.nodes}
                  edges={mockGraphData.edges}
                  onNodeClick={(nodeId) => console.log("Navigate to:", nodeId)}
                />
              </TabsContent>

              <TabsContent value="links" className="flex-1">
                <ScrollArea className="h-full p-4">
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-muted-foreground mb-2">
                      Connected Nodes
                    </div>
                    {mockGraphData.nodes
                      .filter((n) => !n.isCurrent)
                      .map((node) => (
                        <div
                          key={node.id}
                          className="p-3 rounded-lg border bg-background hover:bg-accent/50 cursor-pointer transition-colors"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="text-xs">
                              {node.type}
                            </Badge>
                          </div>
                          <p className="text-sm font-medium">{node.title}</p>
                        </div>
                      ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* AI Copilot Panel */}
        {showCopilot && (
          <CopilotPanel
            copilot={copilot}
            onClose={() => setShowCopilot(false)}
          />
        )}
      </div>
    </div>
  );
}
