"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  NodeProps,
  Handle,
  Position,
  Panel,
  useReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { cn } from "@/lib/utils";
import {
  Beaker,
  FlaskConical,
  Database,
  BarChart3,
  BookOpen,
  Lightbulb,
  FileText,
  HelpCircle,
  GitFork,
  Filter,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Eye,
  ChevronRight,
  ArrowRight,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// =============================================================================
// TYPES
// =============================================================================

export interface KnowledgeNode {
  id: string;
  title: string;
  type: "hypothesis" | "experiment" | "data" | "analysis" | "literature" | "methodology" | "synthesis" | "note" | "question";
  summary?: string;
  confidence?: number;
  forkCount?: number;
  citationCount?: number;
  isCurrent?: boolean;
  isVerified?: boolean;
  author?: string;
  createdAt?: string;
}

export interface KnowledgeEdge {
  id: string;
  source: string;
  target: string;
  type: "supports" | "contradicts" | "extends" | "references" | "derived_from" | "prerequisite" | "related" | "fork" | "proves" | "disproves" | "cites";
  strength?: number;
  label?: string;
}

interface InteractiveKnowledgeGraphProps {
  nodes: KnowledgeNode[];
  edges: KnowledgeEdge[];
  onNodeClick?: (node: KnowledgeNode) => void;
  onNodeDoubleClick?: (node: KnowledgeNode) => void;
  onEdgeClick?: (edge: KnowledgeEdge) => void;
  currentNodeId?: string;
  className?: string;
  showMinimap?: boolean;
  showControls?: boolean;
  height?: string;
}

// =============================================================================
// NODE TYPE CONFIGURATION
// =============================================================================

const nodeTypeConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string; borderColor: string }> = {
  hypothesis: { icon: Lightbulb, color: "#8B5CF6", bgColor: "#8B5CF620", borderColor: "#8B5CF6" },
  experiment: { icon: FlaskConical, color: "#06B6D4", bgColor: "#06B6D420", borderColor: "#06B6D4" },
  data: { icon: Database, color: "#10B981", bgColor: "#10B98120", borderColor: "#10B981" },
  analysis: { icon: BarChart3, color: "#3B82F6", bgColor: "#3B82F620", borderColor: "#3B82F6" },
  literature: { icon: BookOpen, color: "#F59E0B", bgColor: "#F59E0B20", borderColor: "#F59E0B" },
  methodology: { icon: Beaker, color: "#EC4899", bgColor: "#EC489920", borderColor: "#EC4899" },
  synthesis: { icon: GitFork, color: "#6366F1", bgColor: "#6366F120", borderColor: "#6366F1" },
  note: { icon: FileText, color: "#6B7280", bgColor: "#6B728020", borderColor: "#6B7280" },
  question: { icon: HelpCircle, color: "#EF4444", bgColor: "#EF444420", borderColor: "#EF4444" },
};

const edgeTypeConfig: Record<string, { color: string; style: "solid" | "dashed"; label: string }> = {
  supports: { color: "#22C55E", style: "solid", label: "Supports" },
  contradicts: { color: "#EF4444", style: "dashed", label: "Contradicts" },
  extends: { color: "#3B82F6", style: "solid", label: "Extends" },
  references: { color: "#6B7280", style: "dashed", label: "References" },
  derived_from: { color: "#8B5CF6", style: "solid", label: "Derived from" },
  prerequisite: { color: "#F59E0B", style: "dashed", label: "Prerequisite" },
  related: { color: "#6B7280", style: "dashed", label: "Related" },
  fork: { color: "#EC4899", style: "solid", label: "Fork" },
  proves: { color: "#22C55E", style: "solid", label: "Proves" },
  disproves: { color: "#EF4444", style: "solid", label: "Disproves" },
  cites: { color: "#F59E0B", style: "dashed", label: "Cites" },
};

// =============================================================================
// CUSTOM NODE COMPONENT
// =============================================================================

function ResearchNode({ data, selected }: NodeProps) {
  const config = nodeTypeConfig[data.type as string] || nodeTypeConfig.note;
  const Icon = config.icon;
  const isCurrent = Boolean(data.isCurrent);

  return (
    <div
      className={cn(
        "relative px-4 py-3 rounded-xl shadow-lg transition-all duration-200",
        "min-w-[180px] max-w-[280px]",
        selected && "ring-2 ring-offset-2 ring-offset-background",
        isCurrent && "ring-2 ring-primary ring-offset-2"
      )}
      style={{
        backgroundColor: config.bgColor,
        borderWidth: 2,
        borderColor: selected || isCurrent ? config.color : `${config.color}80`,
      }}
    >
      {/* Handles for connections */}
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !border-2"
        style={{ backgroundColor: config.color }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !border-2"
        style={{ backgroundColor: config.color }}
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !border-2"
        style={{ backgroundColor: config.color }}
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !border-2"
        style={{ backgroundColor: config.color }}
      />

      {/* Node content */}
      <div className="flex items-start gap-3">
        <div
          className="p-2 rounded-lg shrink-0"
          style={{ backgroundColor: `${config.color}30` }}
        >
          <Icon className="w-5 h-5" style={{ color: config.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {String(data.title || "")}
            </h3>
            {Boolean(data.isVerified) && (
              <Badge variant="secondary" className="text-xs px-1 py-0 shrink-0">
                Verified
              </Badge>
            )}
          </div>

          {typeof data.summary === "string" && data.summary && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
              {data.summary}
            </p>
          )}

          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
            {typeof data.confidence === "number" && (
              <span className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      (data.confidence as number) > 0.7
                        ? "#22C55E"
                        : (data.confidence as number) > 0.4
                        ? "#F59E0B"
                        : "#EF4444",
                  }}
                />
                {Math.round((data.confidence as number) * 100)}%
              </span>
            )}
            {typeof data.forkCount === "number" && (data.forkCount as number) > 0 && (
              <span className="flex items-center gap-1">
                <GitFork className="w-3 h-3" />
                {data.forkCount as number}
              </span>
            )}
            {typeof data.citationCount === "number" && (data.citationCount as number) > 0 && (
              <span className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                {data.citationCount as number}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Current node indicator */}
      {isCurrent && (
        <div className="absolute -top-2 -right-2 w-4 h-4 bg-primary rounded-full animate-pulse" />
      )}
    </div>
  );
}

const nodeTypes = {
  research: ResearchNode,
};

// =============================================================================
// FORCE LAYOUT ALGORITHM
// =============================================================================

function calculateForceLayout(
  nodes: KnowledgeNode[],
  edges: KnowledgeEdge[],
  currentNodeId?: string
): { x: number; y: number }[] {
  const nodeCount = nodes.length;
  if (nodeCount === 0) return [];

  // Find current node index for centering
  const currentIndex = currentNodeId
    ? nodes.findIndex((n) => n.id === currentNodeId)
    : -1;

  // Initialize positions in a spiral pattern
  const positions: { x: number; y: number }[] = [];
  const centerX = 400;
  const centerY = 300;

  nodes.forEach((node, i) => {
    if (currentIndex >= 0 && i === currentIndex) {
      positions.push({ x: centerX, y: centerY });
    } else {
      const adjustedIndex = currentIndex >= 0 && i > currentIndex ? i - 1 : i;
      const totalOthers = currentIndex >= 0 ? nodeCount - 1 : nodeCount;
      const angle = (2 * Math.PI * adjustedIndex) / totalOthers - Math.PI / 2;
      const radius = 200 + Math.floor(adjustedIndex / 8) * 120;
      positions.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
  });

  // Simple force simulation (multiple iterations)
  const iterations = 50;
  const repulsion = 5000;
  const attraction = 0.1;
  const damping = 0.85;

  const velocities = nodes.map(() => ({ vx: 0, vy: 0 }));

  for (let iter = 0; iter < iterations; iter++) {
    // Repulsion between all nodes
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        const dx = positions[j].x - positions[i].x;
        const dy = positions[j].y - positions[i].y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = repulsion / (dist * dist);

        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;

        velocities[i].vx -= fx;
        velocities[i].vy -= fy;
        velocities[j].vx += fx;
        velocities[j].vy += fy;
      }
    }

    // Attraction along edges
    edges.forEach((edge) => {
      const sourceIdx = nodes.findIndex((n) => n.id === edge.source);
      const targetIdx = nodes.findIndex((n) => n.id === edge.target);
      if (sourceIdx === -1 || targetIdx === -1) return;

      const dx = positions[targetIdx].x - positions[sourceIdx].x;
      const dy = positions[targetIdx].y - positions[sourceIdx].y;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;

      const idealDist = 200;
      const force = (dist - idealDist) * attraction;

      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;

      velocities[sourceIdx].vx += fx;
      velocities[sourceIdx].vy += fy;
      velocities[targetIdx].vx -= fx;
      velocities[targetIdx].vy -= fy;
    });

    // Center attraction for current node
    if (currentIndex >= 0) {
      const dx = centerX - positions[currentIndex].x;
      const dy = centerY - positions[currentIndex].y;
      velocities[currentIndex].vx += dx * 0.1;
      velocities[currentIndex].vy += dy * 0.1;
    }

    // Apply velocities and damping
    for (let i = 0; i < nodeCount; i++) {
      positions[i].x += velocities[i].vx;
      positions[i].y += velocities[i].vy;
      velocities[i].vx *= damping;
      velocities[i].vy *= damping;
    }
  }

  return positions;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

function InteractiveKnowledgeGraphInner({
  nodes: inputNodes,
  edges: inputEdges,
  onNodeClick,
  onNodeDoubleClick,
  onEdgeClick,
  currentNodeId,
  className,
  showMinimap = true,
  showControls = true,
  height = "600px",
}: InteractiveKnowledgeGraphProps) {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  const [selectedNode, setSelectedNode] = useState<KnowledgeNode | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(
    new Set(Object.keys(nodeTypeConfig))
  );
  const [visibleEdgeTypes, setVisibleEdgeTypes] = useState<Set<string>>(
    new Set(Object.keys(edgeTypeConfig))
  );

  // Calculate positions using force layout
  const positions = useMemo(
    () => calculateForceLayout(inputNodes, inputEdges, currentNodeId),
    [inputNodes, inputEdges, currentNodeId]
  );

  // Convert to React Flow format
  const initialNodes: Node[] = useMemo(() => {
    return inputNodes
      .filter((node) => visibleTypes.has(node.type))
      .map((node, index) => ({
        id: node.id,
        type: "research",
        position: positions[index] || { x: 0, y: 0 },
        data: {
          ...node,
          isCurrent: node.id === currentNodeId,
        },
      }));
  }, [inputNodes, positions, currentNodeId, visibleTypes]);

  const initialEdges = useMemo(() => {
    const visibleNodeIds = new Set(initialNodes.map((n) => n.id));
    return inputEdges
      .filter(
        (edge) =>
          visibleEdgeTypes.has(edge.type) &&
          visibleNodeIds.has(edge.source) &&
          visibleNodeIds.has(edge.target)
      )
      .map((edge) => {
        const config = edgeTypeConfig[edge.type] || edgeTypeConfig.related;
        return {
          id: edge.id,
          source: edge.source,
          target: edge.target,
          type: "smoothstep",
          animated: edge.type === "supports" || edge.type === "proves",
          style: {
            stroke: config.color,
            strokeWidth: 2,
            strokeDasharray: config.style === "dashed" ? "5,5" : undefined,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: config.color,
          },
          label: edge.label || config.label,
          labelStyle: { fill: config.color, fontSize: 10 },
          labelBgStyle: { fill: "var(--background)", fillOpacity: 0.8 },
          data: { ...edge } as Record<string, unknown>,
        };
      });
  }, [inputEdges, initialNodes, visibleEdgeTypes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes/edges when input changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Event handlers
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const knowledgeNode = inputNodes.find((n) => n.id === node.id);
      if (knowledgeNode) {
        setSelectedNode(knowledgeNode);
        onNodeClick?.(knowledgeNode);
      }
    },
    [inputNodes, onNodeClick]
  );

  const handleNodeDoubleClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      const knowledgeNode = inputNodes.find((n) => n.id === node.id);
      if (knowledgeNode) {
        onNodeDoubleClick?.(knowledgeNode);
      }
    },
    [inputNodes, onNodeDoubleClick]
  );

  const handleEdgeClick = useCallback(
    (_: React.MouseEvent, edge: Edge) => {
      const knowledgeEdge = inputEdges.find((e) => e.id === edge.id);
      if (knowledgeEdge) {
        onEdgeClick?.(knowledgeEdge);
      }
    },
    [inputEdges, onEdgeClick]
  );

  const toggleNodeType = useCallback((type: string) => {
    setVisibleTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  const toggleEdgeType = useCallback((type: string) => {
    setVisibleEdgeTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }, []);

  return (
    <div className={cn("relative rounded-lg border bg-card", className)} style={{ height }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onEdgeClick={handleEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.1}
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        {/* Background */}
        <Background color="#333" gap={20} size={1} />

        {/* Controls */}
        {showControls && (
          <Panel position="top-right" className="flex gap-2">
            {/* Node Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Nodes
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {Object.entries(nodeTypeConfig).map(([type, config]) => {
                  const Icon = config.icon;
                  return (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={visibleTypes.has(type)}
                      onCheckedChange={() => toggleNodeType(type)}
                    >
                      <Icon className="w-4 h-4 mr-2" style={{ color: config.color }} />
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </DropdownMenuCheckboxItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Edge Type Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <ArrowRight className="w-4 h-4" />
                  Links
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {Object.entries(edgeTypeConfig).map(([type, config]) => (
                  <DropdownMenuCheckboxItem
                    key={type}
                    checked={visibleEdgeTypes.has(type)}
                    onCheckedChange={() => toggleEdgeType(type)}
                  >
                    <div
                      className="w-4 h-0.5 mr-2"
                      style={{
                        backgroundColor: config.color,
                        borderStyle: config.style === "dashed" ? "dashed" : "solid",
                      }}
                    />
                    {config.label}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Zoom Controls */}
            <div className="flex border rounded-md overflow-hidden">
              <Button variant="ghost" size="sm" onClick={() => zoomIn()}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => zoomOut()}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => fitView({ padding: 0.2 })}>
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </Panel>
        )}

        {/* Legend */}
        <Panel position="bottom-left" className="bg-card/80 backdrop-blur p-3 rounded-lg border">
          <div className="text-xs font-medium mb-2">Node Types</div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {Object.entries(nodeTypeConfig).slice(0, 6).map(([type, config]) => {
              const Icon = config.icon;
              return (
                <div key={type} className="flex items-center gap-1">
                  <Icon className="w-3 h-3" style={{ color: config.color }} />
                  <span className="capitalize">{type}</span>
                </div>
              );
            })}
          </div>
          <div className="text-xs font-medium mt-3 mb-2">Link Types</div>
          <div className="flex flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-green-500" />
              <span>Supports</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-red-500 border-dashed" style={{ borderTopWidth: 2 }} />
              <span>Contradicts</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-0.5 bg-blue-500" />
              <span>Extends</span>
            </div>
          </div>
        </Panel>

        {/* MiniMap */}
        {showMinimap && (
          <MiniMap
            nodeColor={(node) => {
              const type = node.data?.type as string;
              return nodeTypeConfig[type]?.color || "#6B7280";
            }}
            nodeStrokeWidth={3}
            pannable
            zoomable
            className="!bg-card/80 !border rounded-lg"
          />
        )}

        {/* Controls (built-in) */}
        <Controls showInteractive={false} className="!bg-card !border rounded-lg" />
      </ReactFlow>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="absolute top-4 left-4 bg-card border rounded-lg shadow-xl p-4 max-w-xs z-50">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2">
              {(() => {
                const config = nodeTypeConfig[selectedNode.type];
                const Icon = config.icon;
                return (
                  <div
                    className="p-2 rounded-lg"
                    style={{ backgroundColor: config.bgColor }}
                  >
                    <Icon className="w-5 h-5" style={{ color: config.color }} />
                  </div>
                );
              })()}
              <div>
                <h3 className="font-semibold">{selectedNode.title}</h3>
                <Badge variant="outline" className="text-xs capitalize">
                  {selectedNode.type}
                </Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setSelectedNode(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {selectedNode.summary && (
            <p className="text-sm text-muted-foreground mb-3">{selectedNode.summary}</p>
          )}

          <div className="grid grid-cols-2 gap-2 text-sm">
            {selectedNode.confidence !== undefined && (
              <div>
                <span className="text-muted-foreground">Confidence:</span>
                <span className="ml-1 font-medium">
                  {Math.round(selectedNode.confidence * 100)}%
                </span>
              </div>
            )}
            {selectedNode.forkCount !== undefined && (
              <div>
                <span className="text-muted-foreground">Forks:</span>
                <span className="ml-1 font-medium">{selectedNode.forkCount}</span>
              </div>
            )}
            {selectedNode.author && (
              <div className="col-span-2">
                <span className="text-muted-foreground">Author:</span>
                <span className="ml-1 font-medium">{selectedNode.author}</span>
              </div>
            )}
          </div>

          {onNodeDoubleClick && (
            <Button
              variant="default"
              size="sm"
              className="w-full mt-3 gap-2"
              onClick={() => onNodeDoubleClick(selectedNode)}
            >
              <Eye className="w-4 h-4" />
              View Details
              <ChevronRight className="w-4 h-4 ml-auto" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

// Wrapper with ReactFlowProvider
export function InteractiveKnowledgeGraph(props: InteractiveKnowledgeGraphProps) {
  return (
    <ReactFlowProvider>
      <InteractiveKnowledgeGraphInner {...props} />
    </ReactFlowProvider>
  );
}

export default InteractiveKnowledgeGraph;
