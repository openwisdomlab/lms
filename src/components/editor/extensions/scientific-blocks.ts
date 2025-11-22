import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

// ============================================================================
// HYPOTHESIS BLOCK
// ============================================================================

export interface HypothesisBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    hypothesisBlock: {
      setHypothesisBlock: () => ReturnType;
    };
  }
}

export const HypothesisBlock = Node.create<HypothesisBlockOptions>({
  name: "hypothesisBlock",
  group: "block",
  content: "block+",
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      confidence: { default: 0.5 },
      testable: { default: true },
      independentVariables: { default: [] },
      dependentVariables: { default: [] },
      predictions: { default: [] },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="hypothesis-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "hypothesis-block",
        class: "scientific-block hypothesis-block",
      }),
      ["div", { class: "scientific-block-header" }, "🔬 Hypothesis"],
      ["div", { class: "scientific-block-content" }, 0],
    ];
  },

  addCommands() {
    return {
      setHypothesisBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [{ type: "paragraph", content: [{ type: "text", text: "State your hypothesis here..." }] }],
          });
        },
    };
  },
});

// ============================================================================
// METHODOLOGY BLOCK
// ============================================================================

export interface MethodologyBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    methodologyBlock: {
      setMethodologyBlock: () => ReturnType;
    };
  }
}

export const MethodologyBlock = Node.create<MethodologyBlockOptions>({
  name: "methodologyBlock",
  group: "block",
  content: "block+",
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      methodType: { default: "experimental" },
      materials: { default: [] },
      steps: { default: [] },
      safetyNotes: { default: [] },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="methodology-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "methodology-block",
        class: "scientific-block methodology-block",
      }),
      ["div", { class: "scientific-block-header" }, "📋 Methodology"],
      ["div", { class: "scientific-block-content" }, 0],
    ];
  },

  addCommands() {
    return {
      setMethodologyBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [{ type: "paragraph", content: [{ type: "text", text: "Describe your methodology..." }] }],
          });
        },
    };
  },
});

// ============================================================================
// DATA BLOCK (with visualization support)
// ============================================================================

export interface DataBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    dataBlock: {
      setDataBlock: (attrs?: { chartType?: string }) => ReturnType;
    };
  }
}

export const DataBlock = Node.create<DataBlockOptions>({
  name: "dataBlock",
  group: "block",
  content: "block+",
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      chartType: { default: null }, // null, 'line', 'bar', 'scatter', 'pie'
      chartConfig: { default: null },
      tableData: { default: null },
      datasetUrl: { default: null },
      rawData: { default: [] },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="data-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "data-block",
        class: "scientific-block data-block",
      }),
      ["div", { class: "scientific-block-header" }, "📊 Data & Results"],
      ["div", { class: "scientific-block-content" }, 0],
    ];
  },

  addCommands() {
    return {
      setDataBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
            content: [{ type: "paragraph", content: [{ type: "text", text: "Present your data here..." }] }],
          });
        },
    };
  },
});

// ============================================================================
// CONCLUSION BLOCK
// ============================================================================

export interface ConclusionBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    conclusionBlock: {
      setConclusionBlock: () => ReturnType;
    };
  }
}

export const ConclusionBlock = Node.create<ConclusionBlockOptions>({
  name: "conclusionBlock",
  group: "block",
  content: "block+",
  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      supportsHypothesis: { default: null },
      confidence: { default: 0.5 },
      limitations: { default: [] },
      keyFindings: { default: [] },
      futureWork: { default: [] },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="conclusion-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "conclusion-block",
        class: "scientific-block conclusion-block",
      }),
      ["div", { class: "scientific-block-header" }, "✅ Conclusion"],
      ["div", { class: "scientific-block-content" }, 0],
    ];
  },

  addCommands() {
    return {
      setConclusionBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [{ type: "paragraph", content: [{ type: "text", text: "State your conclusions..." }] }],
          });
        },
    };
  },
});

// ============================================================================
// CHART BLOCK (Inline data visualization)
// ============================================================================

export interface ChartBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    chartBlock: {
      setChartBlock: (attrs: {
        chartType: string;
        data?: unknown[];
        config?: Record<string, unknown>;
      }) => ReturnType;
    };
  }
}

export const ChartBlock = Node.create<ChartBlockOptions>({
  name: "chartBlock",
  group: "block",
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      chartType: { default: "bar" },
      title: { default: "Chart" },
      data: { default: [] },
      xKey: { default: "x" },
      yKey: { default: "y" },
      config: { default: {} },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="chart-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "chart-block",
        class: "chart-block",
      }),
      ["div", { class: "chart-placeholder" }, `[Chart: ${HTMLAttributes.chartType || "bar"}]`],
    ];
  },

  addCommands() {
    return {
      setChartBlock:
        (attrs) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs,
          });
        },
    };
  },
});

export const scientificExtensions = [
  HypothesisBlock,
  MethodologyBlock,
  DataBlock,
  ConclusionBlock,
  ChartBlock,
];
