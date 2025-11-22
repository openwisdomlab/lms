"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface GraphNode {
  id: string;
  title: string;
  type: string;
  isCurrent?: boolean;
}

interface GraphEdge {
  source: string;
  target: string;
  type: string;
}

interface KnowledgeGraphMiniProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (nodeId: string) => void;
  className?: string;
}

const nodeColors: Record<string, string> = {
  hypothesis: "#8B5CF6",
  experiment: "#06B6D4",
  data: "#10B981",
  analysis: "#3B82F6",
  literature: "#F59E0B",
  methodology: "#EC4899",
  synthesis: "#6366F1",
  note: "#6B7280",
  question: "#EF4444",
};

const edgeColors: Record<string, string> = {
  supports: "#22C55E",
  contradicts: "#EF4444",
  extends: "#3B82F6",
  references: "#6B7280",
  derived_from: "#8B5CF6",
  prerequisite: "#F59E0B",
  related: "#6B7280",
  fork: "#EC4899",
  methodology_from: "#EC4899",
};

export function KnowledgeGraphMini({
  nodes,
  edges,
  onNodeClick,
  className,
}: KnowledgeGraphMiniProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  // Simple force-directed layout simulation
  const getNodePositions = () => {
    const centerX = 150;
    const centerY = 150;
    const radius = 100;

    const positions: Record<string, { x: number; y: number }> = {};

    // Find the current node and place it in center
    const currentNode = nodes.find((n) => n.isCurrent);
    const otherNodes = nodes.filter((n) => !n.isCurrent);

    if (currentNode) {
      positions[currentNode.id] = { x: centerX, y: centerY };
    }

    // Place other nodes in a circle around the center
    otherNodes.forEach((node, i) => {
      const angle = (2 * Math.PI * i) / otherNodes.length - Math.PI / 2;
      positions[node.id] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    return positions;
  };

  const positions = getNodePositions();

  return (
    <div className={cn("graph-container relative", className)}>
      <svg
        ref={svgRef}
        viewBox="0 0 300 300"
        className="w-full h-full"
      >
        {/* Edges */}
        <g className="edges">
          {edges.map((edge, i) => {
            const sourcePos = positions[edge.source];
            const targetPos = positions[edge.target];
            if (!sourcePos || !targetPos) return null;

            return (
              <line
                key={i}
                x1={sourcePos.x}
                y1={sourcePos.y}
                x2={targetPos.x}
                y2={targetPos.y}
                stroke={edgeColors[edge.type] || "#6B7280"}
                strokeWidth={2}
                strokeOpacity={0.6}
                className={cn("graph-edge", `is-${edge.type}`)}
              />
            );
          })}
        </g>

        {/* Nodes */}
        <g className="nodes">
          {nodes.map((node) => {
            const pos = positions[node.id];
            if (!pos) return null;

            const nodeRadius = node.isCurrent ? 20 : 14;

            return (
              <g
                key={node.id}
                className="graph-node"
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onNodeClick?.(node.id)}
                style={{ cursor: node.isCurrent ? "default" : "pointer" }}
              >
                {/* Node circle */}
                <circle
                  r={nodeRadius}
                  fill={nodeColors[node.type] || "#6B7280"}
                  stroke={node.isCurrent ? "#fff" : "transparent"}
                  strokeWidth={node.isCurrent ? 3 : 0}
                  opacity={node.isCurrent ? 1 : 0.8}
                />

                {/* Pulse effect for current node */}
                {node.isCurrent && (
                  <circle
                    r={nodeRadius}
                    fill="none"
                    stroke={nodeColors[node.type] || "#6B7280"}
                    strokeWidth={2}
                    opacity={0.5}
                    className="animate-pulse-ring"
                  />
                )}

                {/* Label */}
                <text
                  y={nodeRadius + 14}
                  textAnchor="middle"
                  className="text-[10px] fill-current"
                  style={{ fontSize: "10px" }}
                >
                  {node.title.length > 15
                    ? node.title.slice(0, 15) + "..."
                    : node.title}
                </text>
              </g>
            );
          })}
        </g>
      </svg>

      {/* Legend */}
      <div className="absolute bottom-2 left-2 right-2 flex flex-wrap gap-2 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span>Supports</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <span>Contradicts</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span>Extends</span>
        </div>
      </div>
    </div>
  );
}
