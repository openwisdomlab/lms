"use client";

import React, { useCallback, useState } from "react";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Link2,
  ChevronDown,
  ChevronUp,
  Beaker,
  Plus,
  X,
  Sparkles,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// =============================================================================
// HYPOTHESIS NODE VIEW
// A structured scientific hypothesis block with:
// - Confidence level slider
// - Independent/Dependent variables
// - Predictions list
// - Testability assessment
// - Evidence linking
// =============================================================================

export function HypothesisNodeView(props: NodeViewProps) {
  const { node, updateAttributes, editor, selected } = props;
  const [isExpanded, setIsExpanded] = useState(true);
  const [newVariable, setNewVariable] = useState("");
  const [newPrediction, setNewPrediction] = useState("");

  const {
    confidence = 0.5,
    testable = true,
    independentVariables = [],
    dependentVariables = [],
    predictions = [],
  } = node.attrs;

  // Confidence level indicator
  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.7) return "text-green-500 bg-green-500/10 border-green-500/30";
    if (conf >= 0.4) return "text-amber-500 bg-amber-500/10 border-amber-500/30";
    return "text-red-500 bg-red-500/10 border-red-500/30";
  };

  const getConfidenceLabel = (conf: number) => {
    if (conf >= 0.8) return "High Confidence";
    if (conf >= 0.6) return "Moderate-High";
    if (conf >= 0.4) return "Moderate";
    if (conf >= 0.2) return "Low-Moderate";
    return "Low Confidence";
  };

  // Variable management
  const addIndependentVariable = useCallback(() => {
    if (!newVariable.trim()) return;
    updateAttributes({
      independentVariables: [...independentVariables, newVariable.trim()],
    });
    setNewVariable("");
  }, [newVariable, independentVariables, updateAttributes]);

  const addDependentVariable = useCallback(() => {
    if (!newVariable.trim()) return;
    updateAttributes({
      dependentVariables: [...dependentVariables, newVariable.trim()],
    });
    setNewVariable("");
  }, [newVariable, dependentVariables, updateAttributes]);

  const removeVariable = useCallback(
    (type: "independent" | "dependent", index: number) => {
      if (type === "independent") {
        updateAttributes({
          independentVariables: independentVariables.filter(
            (_: string, i: number) => i !== index
          ),
        });
      } else {
        updateAttributes({
          dependentVariables: dependentVariables.filter(
            (_: string, i: number) => i !== index
          ),
        });
      }
    },
    [independentVariables, dependentVariables, updateAttributes]
  );

  // Predictions management
  const addPrediction = useCallback(() => {
    if (!newPrediction.trim()) return;
    updateAttributes({
      predictions: [...predictions, newPrediction.trim()],
    });
    setNewPrediction("");
  }, [newPrediction, predictions, updateAttributes]);

  const removePrediction = useCallback(
    (index: number) => {
      updateAttributes({
        predictions: predictions.filter((_: string, i: number) => i !== index),
      });
    },
    [predictions, updateAttributes]
  );

  return (
    <NodeViewWrapper
      className={cn(
        "scientific-block hypothesis-block my-4 rounded-xl border-2 transition-all",
        "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20",
        selected
          ? "border-violet-500 ring-2 ring-violet-500/20"
          : "border-violet-200 dark:border-violet-800"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-violet-200 dark:border-violet-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-violet-100 dark:bg-violet-900/50">
            <Lightbulb className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-violet-900 dark:text-violet-100">
              Hypothesis
            </h3>
            <p className="text-xs text-violet-600 dark:text-violet-400">
              Scientific conjecture to be tested
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Testability indicator */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={cn(
                    "p-1.5 rounded-md transition-colors",
                    testable
                      ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
                  )}
                  onClick={() => updateAttributes({ testable: !testable })}
                >
                  {testable ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <AlertTriangle className="w-4 h-4" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                {testable ? "Testable hypothesis" : "Mark as testable"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Confidence badge */}
          <Badge
            variant="outline"
            className={cn("gap-1 border", getConfidenceColor(confidence))}
          >
            {confidence >= 0.5 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {Math.round(confidence * 100)}%
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
            {/* Confidence Slider */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-violet-100 dark:border-violet-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-violet-700 dark:text-violet-300">
                  Confidence Level
                </label>
                <span
                  className={cn(
                    "text-xs font-medium px-2 py-0.5 rounded",
                    getConfidenceColor(confidence)
                  )}
                >
                  {getConfidenceLabel(confidence)}
                </span>
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
              <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                <span>Speculative</span>
                <span>Well-supported</span>
              </div>
            </div>

            {/* Variables */}
            <div className="grid md:grid-cols-2 gap-3">
              {/* Independent Variables */}
              <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-violet-100 dark:border-violet-800">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium">
                    Independent Variables
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(independentVariables as string[]).map((v, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    >
                      {v}
                      <button
                        onClick={() => removeVariable("independent", i)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Plus className="w-3 h-3" />
                      Add Variable
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-2">
                      <Input
                        placeholder="e.g., Temperature"
                        value={newVariable}
                        onChange={(e) => setNewVariable(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addIndependentVariable();
                        }}
                      />
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={addIndependentVariable}
                      >
                        Add
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              {/* Dependent Variables */}
              <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-violet-100 dark:border-violet-800">
                <div className="flex items-center gap-2 mb-2">
                  <Beaker className="w-4 h-4 text-emerald-500" />
                  <span className="text-sm font-medium">
                    Dependent Variables
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {(dependentVariables as string[]).map((v, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="gap-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                    >
                      {v}
                      <button
                        onClick={() => removeVariable("dependent", i)}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="w-full gap-1">
                      <Plus className="w-3 h-3" />
                      Add Variable
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-64">
                    <div className="space-y-2">
                      <Input
                        placeholder="e.g., Growth Rate"
                        value={newVariable}
                        onChange={(e) => setNewVariable(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addDependentVariable();
                        }}
                      />
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={addDependentVariable}
                      >
                        Add
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Predictions */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-violet-100 dark:border-violet-800">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium">Predictions</span>
                <span className="text-xs text-muted-foreground">
                  (What do you expect to observe?)
                </span>
              </div>
              <div className="space-y-1 mb-2">
                {(predictions as string[]).map((p, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded bg-amber-50 dark:bg-amber-900/20 text-sm"
                  >
                    <span className="text-amber-500 font-medium shrink-0">
                      {i + 1}.
                    </span>
                    <span className="flex-1">{p}</span>
                    <button
                      onClick={() => removePrediction(i)}
                      className="text-muted-foreground hover:text-red-500 shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a prediction..."
                  value={newPrediction}
                  onChange={(e) => setNewPrediction(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addPrediction();
                  }}
                  className="flex-1"
                />
                <Button size="sm" onClick={addPrediction}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Link Evidence Button */}
            <Button
              variant="outline"
              className="w-full gap-2 border-dashed border-violet-300 dark:border-violet-700 text-violet-600 dark:text-violet-400"
            >
              <Link2 className="w-4 h-4" />
              Link Supporting Evidence
            </Button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </NodeViewWrapper>
  );
}
