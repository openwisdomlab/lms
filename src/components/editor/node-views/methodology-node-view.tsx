"use client";

import React, { useCallback, useState } from "react";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  Beaker,
  ClipboardList,
  ShieldAlert,
  Package,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  GripVertical,
  Check,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// =============================================================================
// METHODOLOGY NODE VIEW
// A structured methodology block with:
// - Method type selector
// - Materials/Equipment list
// - Step-by-step procedure
// - Safety notes
// =============================================================================

interface Step {
  id: string;
  text: string;
  completed: boolean;
}

const methodTypes = [
  { value: "experimental", label: "Experimental", icon: "🧪" },
  { value: "observational", label: "Observational", icon: "👁️" },
  { value: "computational", label: "Computational", icon: "💻" },
  { value: "theoretical", label: "Theoretical", icon: "📐" },
  { value: "survey", label: "Survey/Qualitative", icon: "📋" },
  { value: "meta_analysis", label: "Meta-Analysis", icon: "📊" },
];

export function MethodologyNodeView(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props;
  const [isExpanded, setIsExpanded] = useState(true);
  const [newMaterial, setNewMaterial] = useState("");
  const [newStep, setNewStep] = useState("");
  const [newSafetyNote, setNewSafetyNote] = useState("");

  const {
    methodType = "experimental",
    materials = [],
    steps = [],
    safetyNotes = [],
  } = node.attrs;

  // Materials management
  const addMaterial = useCallback(() => {
    if (!newMaterial.trim()) return;
    updateAttributes({
      materials: [...materials, newMaterial.trim()],
    });
    setNewMaterial("");
  }, [newMaterial, materials, updateAttributes]);

  const removeMaterial = useCallback(
    (index: number) => {
      updateAttributes({
        materials: materials.filter((_: string, i: number) => i !== index),
      });
    },
    [materials, updateAttributes]
  );

  // Steps management
  const addStep = useCallback(() => {
    if (!newStep.trim()) return;
    const step: Step = {
      id: Date.now().toString(),
      text: newStep.trim(),
      completed: false,
    };
    updateAttributes({
      steps: [...steps, step],
    });
    setNewStep("");
  }, [newStep, steps, updateAttributes]);

  const toggleStepComplete = useCallback(
    (stepId: string) => {
      updateAttributes({
        steps: steps.map((s: Step) =>
          s.id === stepId ? { ...s, completed: !s.completed } : s
        ),
      });
    },
    [steps, updateAttributes]
  );

  const removeStep = useCallback(
    (stepId: string) => {
      updateAttributes({
        steps: steps.filter((s: Step) => s.id !== stepId),
      });
    },
    [steps, updateAttributes]
  );

  // Safety notes management
  const addSafetyNote = useCallback(() => {
    if (!newSafetyNote.trim()) return;
    updateAttributes({
      safetyNotes: [...safetyNotes, newSafetyNote.trim()],
    });
    setNewSafetyNote("");
  }, [newSafetyNote, safetyNotes, updateAttributes]);

  const removeSafetyNote = useCallback(
    (index: number) => {
      updateAttributes({
        safetyNotes: safetyNotes.filter((_: string, i: number) => i !== index),
      });
    },
    [safetyNotes, updateAttributes]
  );

  const currentMethodType = methodTypes.find((m) => m.value === methodType);

  return (
    <NodeViewWrapper
      className={cn(
        "scientific-block methodology-block my-4 rounded-xl border-2 transition-all",
        "bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20",
        selected
          ? "border-cyan-500 ring-2 ring-cyan-500/20"
          : "border-cyan-200 dark:border-cyan-800"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-200 dark:border-cyan-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/50">
            <Beaker className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h3 className="font-semibold text-cyan-900 dark:text-cyan-100">
              Methodology
            </h3>
            <p className="text-xs text-cyan-600 dark:text-cyan-400">
              Research approach and procedures
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Method Type Selector */}
          <Select
            value={methodType}
            onValueChange={(value) => updateAttributes({ methodType: value })}
          >
            <SelectTrigger className="w-[160px] h-8 text-sm bg-white/50 dark:bg-black/20">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span>{currentMethodType?.icon}</span>
                  <span>{currentMethodType?.label}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {methodTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  <span className="flex items-center gap-2">
                    <span>{type.icon}</span>
                    <span>{type.label}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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

      {/* Description Content */}
      <div className="px-4 py-3">
        <NodeViewContent className="prose prose-sm dark:prose-invert max-w-none focus:outline-none [&>p]:my-1" />
      </div>

      {/* Expanded metadata section */}
      <Collapsible open={isExpanded}>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Materials/Equipment */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-cyan-100 dark:border-cyan-800">
              <div className="flex items-center gap-2 mb-3">
                <Package className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-medium">
                  Materials & Equipment
                </span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {(materials as string[]).map((m, i) => (
                  <Badge
                    key={i}
                    variant="secondary"
                    className="gap-1 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300"
                  >
                    {m}
                    <button
                      onClick={() => removeMaterial(i)}
                      className="hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {materials.length === 0 && (
                  <span className="text-sm text-muted-foreground italic">
                    No materials listed
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add material or equipment..."
                  value={newMaterial}
                  onChange={(e) => setNewMaterial(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addMaterial();
                  }}
                  className="flex-1"
                />
                <Button size="sm" onClick={addMaterial}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Procedure Steps */}
            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-cyan-100 dark:border-cyan-800">
              <div className="flex items-center gap-2 mb-3">
                <ClipboardList className="w-4 h-4 text-cyan-500" />
                <span className="text-sm font-medium">Procedure</span>
                <Badge variant="outline" className="text-xs">
                  {(steps as Step[]).filter((s) => s.completed).length}/
                  {steps.length} completed
                </Badge>
              </div>
              <div className="space-y-2 mb-3">
                {(steps as Step[]).map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      "flex items-start gap-2 p-2 rounded border transition-colors",
                      step.completed
                        ? "bg-cyan-100/50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800"
                        : "bg-white dark:bg-black/10 border-gray-200 dark:border-gray-700"
                    )}
                  >
                    <button
                      onClick={() => toggleStepComplete(step.id)}
                      className={cn(
                        "shrink-0 mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors",
                        step.completed
                          ? "bg-cyan-500 border-cyan-500 text-white"
                          : "border-gray-300 dark:border-gray-600 hover:border-cyan-500"
                      )}
                    >
                      {step.completed && <Check className="w-3 h-3" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-medium text-muted-foreground mr-2">
                        Step {index + 1}:
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          step.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {step.text}
                      </span>
                    </div>
                    <button
                      onClick={() => removeStep(step.id)}
                      className="text-muted-foreground hover:text-red-500 shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {steps.length === 0 && (
                  <p className="text-sm text-muted-foreground italic text-center py-4">
                    No procedure steps defined yet
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  placeholder="Describe the next step..."
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      addStep();
                    }
                  }}
                  className="flex-1 min-h-[60px]"
                />
                <Button size="sm" className="self-end" onClick={addStep}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Safety Notes */}
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                  Safety Notes & Precautions
                </span>
              </div>
              <div className="space-y-2 mb-3">
                {(safetyNotes as string[]).map((note, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2 p-2 rounded bg-amber-100/50 dark:bg-amber-900/20 text-sm"
                  >
                    <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="flex-1 text-amber-800 dark:text-amber-200">
                      {note}
                    </span>
                    <button
                      onClick={() => removeSafetyNote(i)}
                      className="text-muted-foreground hover:text-red-500 shrink-0"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {safetyNotes.length === 0 && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 italic">
                    No safety notes. Add any relevant precautions.
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a safety note..."
                  value={newSafetyNote}
                  onChange={(e) => setNewSafetyNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addSafetyNote();
                  }}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="border-amber-300"
                  onClick={addSafetyNote}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </NodeViewWrapper>
  );
}
