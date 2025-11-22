"use client";

import React from "react";
import { FloatingMenu as TiptapFloatingMenu, BubbleMenu } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Link,
  Highlighter,
  Subscript,
  Superscript,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingMenuProps {
  editor: Editor | null;
}

interface MenuButtonProps {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
}

function MenuButton({ onClick, isActive, children, title }: MenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "p-2 rounded hover:bg-accent transition-colors",
        isActive && "bg-accent text-accent-foreground"
      )}
      title={title}
      type="button"
    >
      {children}
    </button>
  );
}

export function EditorBubbleMenu({ editor }: FloatingMenuProps) {
  if (!editor) return null;

  return (
    <BubbleMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="floating-menu"
    >
      <MenuButton
        onClick={() => editor.chain().focus().toggleBold().run()}
        isActive={editor.isActive("bold")}
        title="Bold (⌘B)"
      >
        <Bold className="w-4 h-4" />
      </MenuButton>

      <MenuButton
        onClick={() => editor.chain().focus().toggleItalic().run()}
        isActive={editor.isActive("italic")}
        title="Italic (⌘I)"
      >
        <Italic className="w-4 h-4" />
      </MenuButton>

      <MenuButton
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        isActive={editor.isActive("underline")}
        title="Underline (⌘U)"
      >
        <Underline className="w-4 h-4" />
      </MenuButton>

      <MenuButton
        onClick={() => editor.chain().focus().toggleStrike().run()}
        isActive={editor.isActive("strike")}
        title="Strikethrough"
      >
        <Strikethrough className="w-4 h-4" />
      </MenuButton>

      <div className="w-px h-6 bg-border mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleCode().run()}
        isActive={editor.isActive("code")}
        title="Code (⌘E)"
      >
        <Code className="w-4 h-4" />
      </MenuButton>

      <MenuButton
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        isActive={editor.isActive("highlight")}
        title="Highlight"
      >
        <Highlighter className="w-4 h-4" />
      </MenuButton>

      <div className="w-px h-6 bg-border mx-1" />

      <MenuButton
        onClick={() => editor.chain().focus().toggleSubscript().run()}
        isActive={editor.isActive("subscript")}
        title="Subscript"
      >
        <Subscript className="w-4 h-4" />
      </MenuButton>

      <MenuButton
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
        isActive={editor.isActive("superscript")}
        title="Superscript"
      >
        <Superscript className="w-4 h-4" />
      </MenuButton>

      <div className="w-px h-6 bg-border mx-1" />

      <MenuButton
        onClick={() => {
          const previousUrl = editor.getAttributes("link").href;
          const url = window.prompt("URL", previousUrl);
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
        }}
        isActive={editor.isActive("link")}
        title="Link (⌘K)"
      >
        <Link className="w-4 h-4" />
      </MenuButton>
    </BubbleMenu>
  );
}

export function EditorFloatingMenu({ editor }: FloatingMenuProps) {
  if (!editor) return null;

  return (
    <TiptapFloatingMenu
      editor={editor}
      tippyOptions={{ duration: 100 }}
      className="floating-menu"
      shouldShow={({ state }) => {
        const { $from } = state.selection;
        const currentLineText = $from.nodeBefore?.textContent;
        return currentLineText === "/" && $from.parentOffset === 1;
      }}
    >
      <span className="text-sm text-muted-foreground px-2">
        Type to filter commands...
      </span>
    </TiptapFloatingMenu>
  );
}
