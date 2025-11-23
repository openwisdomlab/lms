import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { HypothesisNodeView } from "../node-views/hypothesis-node-view";
import { MethodologyNodeView } from "../node-views/methodology-node-view";
import { DataNodeView } from "../node-views/data-node-view";
import { ConclusionNodeView } from "../node-views/conclusion-node-view";

// =============================================================================
// ENHANCED HYPOTHESIS BLOCK
// With NodeView for structured input
// =============================================================================

export interface EnhancedHypothesisBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    enhancedHypothesisBlock: {
      setEnhancedHypothesisBlock: () => ReturnType;
    };
  }
}

export const EnhancedHypothesisBlock = Node.create<EnhancedHypothesisBlockOptions>({
  name: "enhancedHypothesisBlock",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

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
      linkedEvidenceIds: { default: [] },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="enhanced-hypothesis-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "enhanced-hypothesis-block",
        class: "scientific-block hypothesis-block",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(HypothesisNodeView);
  },

  addCommands() {
    return {
      setEnhancedHypothesisBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "State your hypothesis here...",
                  },
                ],
              },
            ],
          });
        },
    };
  },
});

// =============================================================================
// ENHANCED METHODOLOGY BLOCK
// =============================================================================

export interface EnhancedMethodologyBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    enhancedMethodologyBlock: {
      setEnhancedMethodologyBlock: () => ReturnType;
    };
  }
}

export const EnhancedMethodologyBlock = Node.create<EnhancedMethodologyBlockOptions>({
  name: "enhancedMethodologyBlock",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

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
    return [{ tag: 'div[data-type="enhanced-methodology-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "enhanced-methodology-block",
        class: "scientific-block methodology-block",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MethodologyNodeView);
  },

  addCommands() {
    return {
      setEnhancedMethodologyBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Describe your research methodology...",
                  },
                ],
              },
            ],
          });
        },
    };
  },
});

// =============================================================================
// ENHANCED DATA BLOCK
// =============================================================================

export interface EnhancedDataBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    enhancedDataBlock: {
      setEnhancedDataBlock: () => ReturnType;
    };
  }
}

export const EnhancedDataBlock = Node.create<EnhancedDataBlockOptions>({
  name: "enhancedDataBlock",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      chartType: { default: "table" },
      tableData: { default: [] },
      datasetUrl: { default: "" },
      sampleSize: { default: 0 },
      qualityScore: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="enhanced-data-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "enhanced-data-block",
        class: "scientific-block data-block",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DataNodeView);
  },

  addCommands() {
    return {
      setEnhancedDataBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Describe your data collection and results...",
                  },
                ],
              },
            ],
          });
        },
    };
  },
});

// =============================================================================
// ENHANCED CONCLUSION BLOCK
// =============================================================================

export interface EnhancedConclusionBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    enhancedConclusionBlock: {
      setEnhancedConclusionBlock: () => ReturnType;
    };
  }
}

export const EnhancedConclusionBlock = Node.create<EnhancedConclusionBlockOptions>({
  name: "enhancedConclusionBlock",
  group: "block",
  content: "block+",
  defining: true,
  isolating: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      supportsHypothesis: { default: null },
      confidence: { default: 0.5 },
      keyFindings: { default: [] },
      limitations: { default: [] },
      futureWork: { default: [] },
      linkedHypothesisId: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="enhanced-conclusion-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "enhanced-conclusion-block",
        class: "scientific-block conclusion-block",
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ConclusionNodeView);
  },

  addCommands() {
    return {
      setEnhancedConclusionBlock:
        () =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Summarize your conclusions and implications...",
                  },
                ],
              },
            ],
          });
        },
    };
  },
});

// =============================================================================
// EVIDENCE LINK BLOCK
// For creating links between hypotheses and evidence
// =============================================================================

export interface EvidenceLinkBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    evidenceLinkBlock: {
      setEvidenceLinkBlock: (attrs: {
        hypothesisId: string;
        evidenceId: string;
        relationship: string;
      }) => ReturnType;
    };
  }
}

export const EvidenceLinkBlock = Node.create<EvidenceLinkBlockOptions>({
  name: "evidenceLinkBlock",
  group: "block",
  atom: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      hypothesisId: { default: null },
      hypothesisTitle: { default: "" },
      evidenceId: { default: null },
      evidenceTitle: { default: "" },
      relationship: { default: "supports" },
      strength: { default: "experimental" },
      notes: { default: "" },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="evidence-link-block"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    const relationship = HTMLAttributes.relationship || "supports";
    const relationshipColors: Record<string, string> = {
      supports: "border-green-500 bg-green-50",
      contradicts: "border-red-500 bg-red-50",
      partially_supports: "border-amber-500 bg-amber-50",
      inconclusive: "border-gray-500 bg-gray-50",
    };

    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "evidence-link-block",
        class: `evidence-link-block p-3 rounded-lg border-l-4 ${relationshipColors[relationship] || relationshipColors.supports}`,
      }),
      [
        "div",
        { class: "flex items-center gap-2 text-sm" },
        [
          "span",
          { class: "font-medium" },
          `${HTMLAttributes.evidenceTitle || "Evidence"}`,
        ],
        ["span", { class: "text-muted-foreground" }, relationship],
        [
          "span",
          { class: "font-medium" },
          `${HTMLAttributes.hypothesisTitle || "Hypothesis"}`,
        ],
      ],
    ];
  },

  addCommands() {
    return {
      setEvidenceLinkBlock:
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

// =============================================================================
// EXPORT ALL ENHANCED EXTENSIONS
// =============================================================================

export const enhancedScientificExtensions = [
  EnhancedHypothesisBlock,
  EnhancedMethodologyBlock,
  EnhancedDataBlock,
  EnhancedConclusionBlock,
  EvidenceLinkBlock,
];
