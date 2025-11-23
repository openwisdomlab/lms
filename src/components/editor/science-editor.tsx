"use client";

import React, { useCallback, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import Highlight from "@tiptap/extension-highlight";
import Typography from "@tiptap/extension-typography";
import Underline from "@tiptap/extension-underline";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Mathematics from "@tiptap/extension-mathematics";
import { common, createLowlight } from "lowlight";
import tippy, { Instance as TippyInstance } from "tippy.js";

import { cn } from "@/lib/utils";
import { AIBlock } from "./extensions/ai-block";
import { Citation, CitationItem } from "./extensions/citation";
import {
  SlashCommand,
  defaultSlashCommands,
  SlashCommandItem,
} from "./extensions/slash-command";
import { SlashCommandMenu, SlashCommandMenuRef } from "./slash-command-menu";
import { EditorBubbleMenu } from "./floating-menu";
import { createRoot, Root } from "react-dom/client";

// Create lowlight instance with common languages
const lowlight = createLowlight(common);

export interface ScienceEditorProps {
  content?: string | object;
  onChange?: (content: object) => void;
  onCitationSearch?: (query: string) => Promise<CitationItem[]>;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  autofocus?: boolean;
}

export function ScienceEditor({
  content,
  onChange,
  onCitationSearch,
  placeholder = "Start typing or press '/' for commands...",
  editable = true,
  className,
  autofocus = false,
}: ScienceEditorProps) {
  const menuRef = useRef<SlashCommandMenuRef>(null);

  // Slash command suggestion configuration
  const slashCommandSuggestion = {
    items: ({ query }: { query: string }) => {
      return defaultSlashCommands.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
      );
    },
    render: () => {
      let component: HTMLDivElement | null = null;
      let popup: TippyInstance[] | null = null;
      let reactRoot: Root | null = null;

      return {
        onStart: (props: {
          query: string;
          items: SlashCommandItem[];
          command: (item: SlashCommandItem) => void;
          clientRect?: (() => DOMRect | null) | null;
        }) => {
          component = document.createElement("div");
          reactRoot = createRoot(component);

          reactRoot.render(
            <SlashCommandMenu
              ref={menuRef}
              items={props.items}
              command={props.command}
            />
          );

          if (!props.clientRect) return;

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          });
        },

        onUpdate: (props: {
          query: string;
          items: SlashCommandItem[];
          command: (item: SlashCommandItem) => void;
          clientRect?: (() => DOMRect | null) | null;
        }) => {
          if (reactRoot && component) {
            reactRoot.render(
              <SlashCommandMenu
                ref={menuRef}
                items={props.items}
                command={props.command}
              />
            );
          }

          if (!props.clientRect || !popup) return;

          popup[0]?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });
        },

        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === "Escape") {
            popup?.[0]?.hide();
            return true;
          }

          return menuRef.current?.onKeyDown(props) || false;
        },

        onExit: () => {
          popup?.[0]?.destroy();
          reactRoot?.unmount();
        },
      };
    },
  };

  // Citation suggestion configuration
  const citationSuggestion = {
    items: async ({ query }: { query: string }) => {
      if (onCitationSearch) {
        return await onCitationSearch(query);
      }
      // Default mock data for development
      const mockItems: CitationItem[] = [
        { id: "1", title: "Einstein's Relativity", type: "literature", author: "A. Einstein" },
        { id: "2", title: "Quantum Mechanics Intro", type: "note", author: "R. Feynman" },
        { id: "3", title: "Mars Colonization Study", type: "hypothesis", author: "E. Musk" },
      ];
      return mockItems.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.author?.toLowerCase().includes(query.toLowerCase())
      );
    },
    render: () => {
      let component: HTMLDivElement | null = null;
      let popup: TippyInstance[] | null = null;
      let reactRoot: Root | null = null;

      return {
        onStart: (props: {
          query: string;
          items: CitationItem[];
          command: (item: { id: string; label: string }) => void;
          clientRect?: (() => DOMRect | null) | null;
        }) => {
          component = document.createElement("div");
          reactRoot = createRoot(component);

          reactRoot.render(
            <CitationMenu
              items={props.items}
              command={(item) =>
                props.command({ id: item.id, label: item.title })
              }
            />
          );

          if (!props.clientRect) return;

          popup = tippy("body", {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          });
        },

        onUpdate: (props: {
          query: string;
          items: CitationItem[];
          command: (item: { id: string; label: string }) => void;
          clientRect?: (() => DOMRect | null) | null;
        }) => {
          if (reactRoot && component) {
            reactRoot.render(
              <CitationMenu
                items={props.items}
                command={(item) =>
                  props.command({ id: item.id, label: item.title })
                }
              />
            );
          }

          if (!props.clientRect || !popup) return;

          popup[0]?.setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });
        },

        onKeyDown: (props: { event: KeyboardEvent }) => {
          if (props.event.key === "Escape") {
            popup?.[0]?.hide();
            return true;
          }
          return false;
        },

        onExit: () => {
          popup?.[0]?.destroy();
          reactRoot?.unmount();
        },
      };
    },
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Using CodeBlockLowlight instead
      }),
      Placeholder.configure({
        placeholder,
        emptyEditorClass: "is-editor-empty",
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-lg max-w-full h-auto",
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: "not-prose",
        },
      }),
      TaskItem.configure({
        nested: true,
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      Underline,
      Subscript,
      Superscript,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "not-prose",
        },
      }),
      Mathematics,
      AIBlock,
      Citation.configure({
        suggestion: citationSuggestion,
      }),
      SlashCommand.configure({
        suggestion: slashCommandSuggestion,
      }),
    ],
    content: content || "",
    editable,
    autofocus,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose dark:prose-invert max-w-none focus:outline-none min-h-[200px] px-4 py-3",
          className
        ),
      },
    },
  });

  return (
    <div className="relative w-full border rounded-lg bg-background">
      <EditorBubbleMenu editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

// Citation Menu Component
function CitationMenu({
  items,
  command,
}: {
  items: CitationItem[];
  command: (item: CitationItem) => void;
}) {
  if (items.length === 0) {
    return (
      <div className="bg-popover border rounded-lg shadow-lg p-3 text-sm text-muted-foreground">
        No results found
      </div>
    );
  }

  return (
    <div className="bg-popover border rounded-lg shadow-lg overflow-hidden min-w-[250px] max-h-[300px] overflow-y-auto">
      {items.map((item) => (
        <button
          key={item.id}
          className="w-full text-left px-3 py-2 hover:bg-accent flex flex-col gap-0.5 transition-colors"
          onClick={() => command(item)}
        >
          <span className="font-medium text-sm">{item.title}</span>
          <span className="text-xs text-muted-foreground">
            {item.type} {item.author && `• ${item.author}`}
          </span>
        </button>
      ))}
    </div>
  );
}

export default ScienceEditor;
