"use client";

import React, { useState, useCallback } from "react";
import { NodeViewWrapper, NodeViewContent, NodeViewProps } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  Database,
  Table,
  BarChart3,
  PieChart,
  LineChart,
  Upload,
  Link2,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Download,
  Eye,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// =============================================================================
// DATA NODE VIEW
// A structured data block with:
// - Data visualization type selector
// - Sample size and quality metrics
// - Table/Chart preview
// - Data source linking
// =============================================================================

interface DataPoint {
  label: string;
  value: number;
}

const chartTypes = [
  { value: "table", label: "Table", icon: Table },
  { value: "bar", label: "Bar Chart", icon: BarChart3 },
  { value: "line", label: "Line Chart", icon: LineChart },
  { value: "pie", label: "Pie Chart", icon: PieChart },
];

export function DataNodeView(props: NodeViewProps) {
  const { node, updateAttributes, selected } = props;
  const [isExpanded, setIsExpanded] = useState(true);
  const [newLabel, setNewLabel] = useState("");
  const [newValue, setNewValue] = useState("");

  const {
    chartType = "table",
    tableData = [],
    datasetUrl = "",
    sampleSize = 0,
    qualityScore = null,
  } = node.attrs;

  // Add data point
  const addDataPoint = useCallback(() => {
    if (!newLabel.trim() || !newValue.trim()) return;
    const point: DataPoint = {
      label: newLabel.trim(),
      value: parseFloat(newValue) || 0,
    };
    updateAttributes({
      tableData: [...tableData, point],
    });
    setNewLabel("");
    setNewValue("");
  }, [newLabel, newValue, tableData, updateAttributes]);

  // Remove data point
  const removeDataPoint = useCallback(
    (index: number) => {
      updateAttributes({
        tableData: tableData.filter((_: DataPoint, i: number) => i !== index),
      });
    },
    [tableData, updateAttributes]
  );

  // Calculate statistics
  const stats =
    tableData.length > 0
      ? {
          count: tableData.length,
          sum: (tableData as DataPoint[]).reduce((acc, d) => acc + d.value, 0),
          mean:
            (tableData as DataPoint[]).reduce((acc, d) => acc + d.value, 0) /
            tableData.length,
          max: Math.max(...(tableData as DataPoint[]).map((d) => d.value)),
          min: Math.min(...(tableData as DataPoint[]).map((d) => d.value)),
        }
      : null;

  const ChartIcon = chartTypes.find((c) => c.value === chartType)?.icon || Table;

  return (
    <NodeViewWrapper
      className={cn(
        "scientific-block data-block my-4 rounded-xl border-2 transition-all",
        "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20",
        selected
          ? "border-emerald-500 ring-2 ring-emerald-500/20"
          : "border-emerald-200 dark:border-emerald-800"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-emerald-200 dark:border-emerald-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/50">
            <Database className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900 dark:text-emerald-100">
              Data & Results
            </h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-400">
              Collected data and measurements
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Stats badges */}
          {sampleSize > 0 && (
            <Badge
              variant="outline"
              className="bg-emerald-100/50 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700"
            >
              n={sampleSize}
            </Badge>
          )}
          {qualityScore !== null && (
            <Badge
              variant="outline"
              className={cn(
                "border",
                qualityScore >= 0.8
                  ? "bg-green-100 text-green-700 border-green-300"
                  : qualityScore >= 0.5
                  ? "bg-amber-100 text-amber-700 border-amber-300"
                  : "bg-red-100 text-red-700 border-red-300"
              )}
            >
              Quality: {Math.round(qualityScore * 100)}%
            </Badge>
          )}

          {/* Chart Type Selector */}
          <Select
            value={chartType}
            onValueChange={(value) => updateAttributes({ chartType: value })}
          >
            <SelectTrigger className="w-[130px] h-8 text-sm bg-white/50 dark:bg-black/20">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <ChartIcon className="w-4 h-4" />
                  <span>
                    {chartTypes.find((c) => c.value === chartType)?.label}
                  </span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {chartTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <SelectItem key={type.value} value={type.value}>
                    <span className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{type.label}</span>
                    </span>
                  </SelectItem>
                );
              })}
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

      {/* Expanded data section */}
      <Collapsible open={isExpanded}>
        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            {/* Data Entry & Preview Tabs */}
            <Tabs defaultValue="data" className="w-full">
              <TabsList className="w-full grid grid-cols-3 h-9">
                <TabsTrigger value="data" className="gap-1 text-xs">
                  <Table className="w-3 h-3" />
                  Data Entry
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-1 text-xs">
                  <Eye className="w-3 h-3" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="stats" className="gap-1 text-xs">
                  <BarChart3 className="w-3 h-3" />
                  Statistics
                </TabsTrigger>
              </TabsList>

              {/* Data Entry Tab */}
              <TabsContent value="data" className="mt-3">
                <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-emerald-100 dark:border-emerald-800">
                  {/* Data Table */}
                  <div className="mb-3">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-emerald-200 dark:border-emerald-700">
                          <th className="text-left py-2 px-3 font-medium text-emerald-700 dark:text-emerald-300">
                            Label
                          </th>
                          <th className="text-right py-2 px-3 font-medium text-emerald-700 dark:text-emerald-300">
                            Value
                          </th>
                          <th className="w-10"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(tableData as DataPoint[]).map((point, index) => (
                          <tr
                            key={index}
                            className="border-b border-emerald-100 dark:border-emerald-800 last:border-0"
                          >
                            <td className="py-2 px-3">{point.label}</td>
                            <td className="py-2 px-3 text-right font-mono">
                              {point.value.toLocaleString()}
                            </td>
                            <td className="py-2 px-1">
                              <button
                                onClick={() => removeDataPoint(index)}
                                className="p-1 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </td>
                          </tr>
                        ))}
                        {tableData.length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="py-6 text-center text-muted-foreground italic"
                            >
                              No data points. Add some below.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Add Data Point */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Label (e.g., Trial 1)"
                      value={newLabel}
                      onChange={(e) => setNewLabel(e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Value"
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addDataPoint();
                      }}
                      className="w-32"
                    />
                    <Button size="sm" onClick={addDataPoint}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview" className="mt-3">
                <div className="p-4 rounded-lg bg-white/50 dark:bg-black/20 border border-emerald-100 dark:border-emerald-800 min-h-[200px]">
                  {tableData.length > 0 ? (
                    chartType === "bar" ? (
                      // Simple bar chart visualization
                      <div className="space-y-2">
                        {(tableData as DataPoint[]).map((point, index) => {
                          const maxVal = Math.max(
                            ...(tableData as DataPoint[]).map((d) => d.value)
                          );
                          const percentage = (point.value / maxVal) * 100;
                          return (
                            <div key={index} className="flex items-center gap-2">
                              <span className="w-24 text-sm truncate">
                                {point.label}
                              </span>
                              <div className="flex-1 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded transition-all"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="w-16 text-right text-sm font-mono">
                                {point.value.toLocaleString()}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : chartType === "pie" ? (
                      // Simple pie chart representation
                      <div className="flex items-center justify-center gap-8">
                        <div className="w-40 h-40 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 relative overflow-hidden">
                          {(tableData as DataPoint[]).map((point, index) => {
                            const total = (tableData as DataPoint[]).reduce(
                              (sum, d) => sum + d.value,
                              0
                            );
                            const percent = (point.value / total) * 100;
                            return (
                              <div
                                key={index}
                                className="absolute inset-0 flex items-center justify-center"
                              >
                                <span className="text-white text-lg font-bold">
                                  {Math.round(percent)}%
                                </span>
                              </div>
                            );
                          })}
                        </div>
                        <div className="space-y-1">
                          {(tableData as DataPoint[]).map((point, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 text-sm"
                            >
                              <div
                                className="w-3 h-3 rounded-sm"
                                style={{
                                  backgroundColor: `hsl(${
                                    150 + index * 30
                                  }, 70%, 50%)`,
                                }}
                              />
                              <span>{point.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      // Table view
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-emerald-300">
                            <th className="text-left py-2 px-3 font-semibold">
                              Label
                            </th>
                            <th className="text-right py-2 px-3 font-semibold">
                              Value
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {(tableData as DataPoint[]).map((point, index) => (
                            <tr
                              key={index}
                              className="border-b border-emerald-100 dark:border-emerald-800"
                            >
                              <td className="py-2 px-3">{point.label}</td>
                              <td className="py-2 px-3 text-right font-mono">
                                {point.value.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                      <BarChart3 className="w-12 h-12 mb-2 opacity-30" />
                      <p>No data to preview</p>
                      <p className="text-xs">Add data points in the Data Entry tab</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Statistics Tab */}
              <TabsContent value="stats" className="mt-3">
                <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-emerald-100 dark:border-emerald-800">
                  {stats ? (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div className="text-center p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20">
                        <p className="text-xs text-muted-foreground">Count</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                          {stats.count}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20">
                        <p className="text-xs text-muted-foreground">Sum</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                          {stats.sum.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20">
                        <p className="text-xs text-muted-foreground">Mean</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                          {stats.mean.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20">
                        <p className="text-xs text-muted-foreground">Min</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                          {stats.min.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-emerald-100/50 dark:bg-emerald-900/20">
                        <p className="text-xs text-muted-foreground">Max</p>
                        <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                          {stats.max.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-6">
                      Add data points to see statistics
                    </p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            {/* Sample Size & Quality */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-emerald-100 dark:border-emerald-800">
                <label className="text-sm font-medium block mb-2">
                  Sample Size (n)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 100"
                  value={sampleSize || ""}
                  onChange={(e) =>
                    updateAttributes({ sampleSize: parseInt(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 border border-emerald-100 dark:border-emerald-800">
                <label className="text-sm font-medium block mb-2">
                  Data Quality (0-100%)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 95"
                  min={0}
                  max={100}
                  value={qualityScore !== null ? Math.round(qualityScore * 100) : ""}
                  onChange={(e) =>
                    updateAttributes({
                      qualityScore: parseInt(e.target.value) / 100 || null,
                    })
                  }
                />
              </div>
            </div>

            {/* Data Source Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1 gap-2 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600"
              >
                <Upload className="w-4 h-4" />
                Upload Dataset
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2 border-dashed border-emerald-300 dark:border-emerald-700 text-emerald-600"
              >
                <Link2 className="w-4 h-4" />
                Link External Data
              </Button>
              {tableData.length > 0 && (
                <Button
                  variant="outline"
                  size="icon"
                  className="border-emerald-300 dark:border-emerald-700 text-emerald-600"
                >
                  <Download className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </NodeViewWrapper>
  );
}
