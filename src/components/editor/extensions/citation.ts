import { Node, mergeAttributes } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Mention from "@tiptap/extension-mention";

export interface CitationOptions {
  HTMLAttributes: Record<string, unknown>;
  suggestion: {
    items: (props: { query: string }) => Promise<CitationItem[]> | CitationItem[];
    render: () => {
      onStart: (props: SuggestionProps) => void;
      onUpdate: (props: SuggestionProps) => void;
      onKeyDown: (props: { event: KeyboardEvent }) => boolean;
      onExit: () => void;
    };
  };
}

export interface CitationItem {
  id: string;
  title: string;
  type: string;
  author?: string;
}

export interface SuggestionProps {
  query: string;
  items: CitationItem[];
  command: (item: CitationItem) => void;
  clientRect: (() => DOMRect | null) | null;
}

export const CitationPluginKey = new PluginKey("citation");

export const Citation = Mention.extend({
  name: "citation",

  addOptions() {
    return {
      ...this.parent?.(),
      HTMLAttributes: {
        class: "citation",
      },
      renderLabel({ node }: { node: { attrs: { label: string } } }) {
        return `@${node.attrs.label}`;
      },
      suggestion: {
        char: "@",
        pluginKey: CitationPluginKey,
        items: async () => [],
        render: () => ({
          onStart: () => {},
          onUpdate: () => {},
          onKeyDown: () => false,
          onExit: () => {},
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: `span[data-type="${this.name}"]`,
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(
        { "data-type": this.name },
        this.options.HTMLAttributes,
        HTMLAttributes
      ),
      `@${node.attrs.label || node.attrs.id}`,
    ];
  },

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-id"),
        renderHTML: (attributes) => {
          if (!attributes.id) return {};
          return { "data-id": attributes.id };
        },
      },
      label: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-label"),
        renderHTML: (attributes) => {
          if (!attributes.label) return {};
          return { "data-label": attributes.label };
        },
      },
      nodeType: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-node-type"),
        renderHTML: (attributes) => {
          if (!attributes.nodeType) return {};
          return { "data-node-type": attributes.nodeType };
        },
      },
    };
  },
});

export default Citation;
