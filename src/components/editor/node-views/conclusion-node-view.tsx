"use client";

import React, { useState, useCallback } from "react";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  Lightbulb,
  ArrowRight,
  Link2,
  Sparkles,
  Target,
  FileWarning,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";

// =============================================================================
// CONCLUSION NODE VIEW
// A structured conclusion block with:
// - Hypothesis support assessment
// - Confidence level
// - Key findings list
// - Limitations
// - Future work suggestions
// =============================================================================

export function ConclusionNodeView(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props;
  const [isExpanded, setIsExpanded] = useState(true);
  const [newFinding, setNewFinding] = useState("");
  const [newLimitation, setNewLimitation] = useState("");
  const [newFutureWork, setNewFutureWork] = useState("");

  const {
    supportsHypothesis = null,
    confidence = 0.5,
    keyFindings = [],
    limitations = [],
    futureWork = [],
  } = node.attrs;

  // Findings management
  const addFinding = useCallback(() => {
    if (!newFinding.trim()) return;
    updateAttributes({
      keyFindings: [...keyFindings, newFinding.trim()],
    });
    setNewFinding("");
  }, [newFinding, keyFindings, updateAttributes]);

  const removeFinding = useCallback(
    (index: number) => {
      updateAttributes({
        keyFindings: keyFindings.filter((_: string, i: number) => i !== index),
      });
    },
    [keyFindings, updateAttributes]
  );

  // Limitations management
  const addLimitation = useCallback(() => {
    if (!newLimitation.trim()) return;
    updateAttributes({
      limitations: [...limitations, newLimitation.trim()],
    });
    setNewLimitation("");
  }, [newLimitation, limitations, updateAttributes]);

  const removeLimitation = useCallback(
    (index: number) => {
      updateAttributes({
        limitations: limitations.filter((_: string, i: number) => i !== index),
      });
    },
    [limitations, updateAttributes]
  );

  // Future work management
  const addFutureWork = useCallback(() => {
    if (!newFutureWork.trim()) return;
    updateAttributes({
      futureWork: [...futureWork, newFutureWork.trim()],
    });
    setNewFutureWork("");
  }, [newFutureWork, futureWork, updateAttributes]);

  const removeFutureWork = useCallback(
    (index: number) => {
      updateAttributes({
        futureWork: futureWork.filter((_: string, i: number) => i !== index),
      });
    },
    [futureWork, updateAttributes]
  );

  // Get support status display
  const getSupportStatus = () => {
    if (supportsHypothesis === true) {
      return {
        icon: CheckCircle2,
        label: "Supports Hypothesis",
        color: "text-green-600 bg-green-100 dark:bg-green-900/30 border-green-300",
      };
    }
    if (supportsHypothesis === false) {
      return {
        icon: XCircle,
        label: "Contradicts Hypothesis",
        color: "text-red-600 bg-red-100 dark:bg-red-900/30 border-red-300",
      };
    }
    return {
      icon: HelpCircle,
      label: "Inconclusive",
      color: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 border-amber-300",
    };
  };

  const supportStatus = getSupportStatus();
  const StatusIcon = supportStatus.icon;

  // Confidence display
  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return "Very High";
    if (conf >= 0.6) return "High";
    if (conf >= 0.4) return "Moderate";
    if (conf >= 0.2) return "Low";
    return "Very Low";
  };

  return (
    <NodeViewWrapper
      className={cn(
        "scientific-block conclusion-block my-4 rounded-xl border-2 transition-all",
        "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20",
        selected
          ? "border-blue-500 ring-2 ring-blue-500/20"
          : "border-blue-200 dark:border-blue-800"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50">
            <CheckCircle2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Conclusion
            </h3>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Summary of findings and implications
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Support Status Badge */}
          <Badge
            variant="outline"
            className={cn("gap-1 border", supportStatus.color)}
          >
            <StatusIcon className="w-3 h-3" />
            {supportStatus.label}
          </Badge>

          {/* Confidence Badge */}
          <Badge variant="outline" className="gap-1 bg-blue-100/50 dark:bg-blue-900/30">
            {Math.round(confidence * 100)}% confidence
          </Badge>

          {/* Expand/Collapse */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 py-3">
        <NodeViewContent className="prose prose-sm dark:prose-invert max-w-none focus:outline-none [&>p]:my-1" />
      </div>

      {/* Expanded metadata section */}
      <Collapsible open={isExpanded}>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Hypothesis Support Toggle */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-blue-100 dark:border-blue-800">
              <label className="text-sm font-medium block mb-3">
                Does the evidence support the hypothesis?
              </label>
              <ToggleGroup
                type="single"
                value={
                  supportsHypothesis === true
                    ? "yes"
                    : supportsHypothesis === false
                    ? "no"
                    : "inconclusive"
                }
                onValueChange={(value) => {
                  if (value === "yes") updateAttributes({ supportsHypothesis: true });
                  else if (value === "no")
                    updateAttributes({ supportsHypothesis: false });
                  else updateAttributes({ supportsHypothesis: null });
                }}
                className="justify-start"
              >
                <ToggleGroupItem
                  value="yes"
                  className="gap-1 data-[state=on]:bg-green-100 data-[state=on]:text-green-700"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Supports
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="no"
                  className="gap-1 data-[state=on]:bg-red-100 data-[state=on]:text-red-700"
                >
                  <XCircle className="w-4 h-4" />
                  Contradicts
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="inconclusive"
                  className="gap-1 data-[state=on]:bg-amber-100 data-[state=on]:text-amber-700"
                >
                  <HelpCircle className="w-4 h-4" />
                  Inconclusive
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            {/* Confidence Slider */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">
                  Conclusion Confidence
                </label>
                <Badge variant="outline">
                  {getConfidenceLabel(confidence)}
                </Badge>
              </div>
              <Slider
                value={[confidence * 100]}
                onValueChange={([value]) =>
                  updateAttributes({ confidence: value / 100 })
                }
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Key Findings */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Key Findings</span>
              </div>
              <div className="space-y-2 mb-3">
                {(keyFindings as string[]).map((finding, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded bg-blue-100/50 dark:bg-blue-900/20"
                  >
                    <Target className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span className="flex-1 text-sm">{finding}</span>
                    <button
                      onClick={() => removeFinding(i)}
                      className="text-muted-foreground hover:text-red-500 shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {keyFindings.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-2">
                    No key findings listed
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a key finding..."
                  value={newFinding}
                  onChange={(e) => setNewFinding(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addFinding();
                  }}
                  className="flex-1"
                />
                <Button size="sm" onClick={addFinding}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Limitations */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-3">
                <FileWarning className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Limitations
                </span>
              </div>
              <div className="space-y-2 mb-3">
                {(limitations as string[]).map((limitation, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded bg-amber-100/50 dark:bg-amber-900/20"
                  >
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="flex-1 text-sm text-amber-800 dark:text-amber-200">
                      {limitation}
                    </span>
                    <button
                      onClick={() => removeLimitation(i)}
                      className="text-muted-foreground hover:text-red-500 shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {limitations.length === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 italic text-center py-2">
                    Acknowledge study limitations for transparency
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a limitation..."
                  value={newLimitation}
                  onChange={(e) => setNewLimitation(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addLimitation();
                  }}
                  className="flex-1"
                />
                <Button size="sm" variant="outline" onClick={addLimitation}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Future Work */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-blue-100 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-3">
                <ArrowRight className="w-4 h-4 text-indigo-500" />
                <span className="text-sm font-medium">Future Work</span>
              </div>
              <div className="space-y-2 mb-3">
                {(futureWork as string[]).map((work, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded bg-indigo-100/50 dark:bg-indigo-900/20"
                  >
                    <Lightbulb className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="flex-1 text-sm">{work}</span>
                    <button
                      onClick={() => removeFutureWork(i)}
                      className="text-muted-foreground hover:text-red-500 shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {futureWork.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-2">
                    Suggest directions for future research
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Suggest future research directions..."
                  value={newFutureWork}
                  onChange={(e) => setNewFutureWork(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addFutureWork();
                    }
                  }}
                  className="flex-1 min-h-[60px]"
                />
                <Button size="sm" className="self-end" onClick={addFutureWork}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Link to Hypothesis */}
            <Button
              variant="outline"
              className="w-full gap-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400"
            >
              <Link2 className="w-4 h-4" />
              Link to Original Hypothesis
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </NodeViewWrapper>
  );
}
