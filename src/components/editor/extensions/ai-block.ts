import { Node, mergeAttributes } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

export interface AIBlockOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiBlock: {
      setAIBlock: (attributes?: { prompt?: string }) => ReturnType;
    };
  }
}

export const AIBlock = Node.create<AIBlockOptions>({
  name: "aiBlock",

  group: "block",

  content: "inline*",

  defining: true,

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  addAttributes() {
    return {
      prompt: {
        default: "",
      },
      response: {
        default: "",
      },
      status: {
        default: "idle", // idle, loading, complete, error
      },
      analysisType: {
        default: "hypothesis", // hypothesis, methodology, data, general
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="ai-block"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        "data-type": "ai-block",
        class: "ai-block",
      }),
      0,
    ];
  },

  addCommands() {
    return {
      setAIBlock:
        (attributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: attributes,
          });
        },
    };
  },
});

export default AIBlock;
