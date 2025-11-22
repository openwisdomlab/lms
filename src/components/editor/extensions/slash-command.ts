import { Extension } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import Suggestion from "@tiptap/suggestion";
import type { Editor, Range } from "@tiptap/core";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

export interface SlashCommandOptions {
  suggestion: {
    items: (props: { query: string }) => SlashCommandItem[];
    render: () => {
      onStart: (props: SuggestionProps) => void;
      onUpdate: (props: SuggestionProps) => void;
      onKeyDown: (props: { event: KeyboardEvent }) => boolean;
      onExit: () => void;
    };
  };
}

export interface SuggestionProps {
  query: string;
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  clientRect: (() => DOMRect | null) | null;
  editor: Editor;
  range: Range;
}

export const SlashCommandPluginKey = new PluginKey("slash-command");

export const SlashCommand = Extension.create<SlashCommandOptions>({
  name: "slash-command",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: SlashCommandItem;
        }) => {
          props.command({ editor, range });
        },
        items: () => [],
        render: () => ({
          onStart: () => {},
          onUpdate: () => {},
          onKeyDown: () => false,
          onExit: () => {},
        }),
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        pluginKey: SlashCommandPluginKey,
      }),
    ];
  },
});

export const defaultSlashCommands: SlashCommandItem[] = [
  {
    title: "Text",
    description: "Start writing with plain text",
    icon: "type",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
    },
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: "heading-1",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: "heading-2",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: "heading-3",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
    },
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list",
    icon: "list",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered List",
    description: "Create a numbered list",
    icon: "list-ordered",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Task List",
    description: "Track tasks with a to-do list",
    icon: "check-square",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Code Block",
    description: "Insert a code block with syntax highlighting",
    icon: "code",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Math Block",
    description: "Insert a LaTeX math equation",
    icon: "sigma",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "mathBlock",
          content: [{ type: "text", text: "E = mc^2" }],
        })
        .run();
    },
  },
  {
    title: "Quote",
    description: "Add a blockquote",
    icon: "quote",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Divider",
    description: "Insert a horizontal divider",
    icon: "minus",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
  {
    title: "AI Analysis",
    description: "Get AI feedback on your hypothesis",
    icon: "sparkles",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "aiBlock",
          attrs: { analysisType: "hypothesis" },
        })
        .run();
    },
  },
  {
    title: "Table",
    description: "Insert a table for data",
    icon: "table",
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: "Image",
    description: "Upload or embed an image",
    icon: "image",
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      // Image upload would be handled by a separate UI
      const url = window.prompt("Enter image URL:");
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    },
  },
];

export default SlashCommand;
