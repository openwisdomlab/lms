"use client";

import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  useCallback,
} from "react";
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  CheckSquare,
  Code,
  Quote,
  Minus,
  Sparkles,
  Table,
  Image,
  Sigma,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SlashCommandItem } from "./extensions/slash-command";

const iconMap: Record<string, React.ElementType> = {
  type: Type,
  "heading-1": Heading1,
  "heading-2": Heading2,
  "heading-3": Heading3,
  list: List,
  "list-ordered": ListOrdered,
  "check-square": CheckSquare,
  code: Code,
  quote: Quote,
  minus: Minus,
  sparkles: Sparkles,
  table: Table,
  image: Image,
  sigma: Sigma,
};

export interface SlashCommandMenuRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

interface SlashCommandMenuProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
}

export const SlashCommandMenu = forwardRef<
  SlashCommandMenuRef,
  SlashCommandMenuProps
>(({ items, command }, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = useCallback(
    (index: number) => {
      const item = items[index];
      if (item) {
        command(item);
      }
    },
    [items, command]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [items]);

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === "ArrowUp") {
        setSelectedIndex((prev) => (prev + items.length - 1) % items.length);
        return true;
      }

      if (event.key === "ArrowDown") {
        setSelectedIndex((prev) => (prev + 1) % items.length);
        return true;
      }

      if (event.key === "Enter") {
        selectItem(selectedIndex);
        return true;
      }

      return false;
    },
  }));

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="slash-command-menu max-h-[300px] overflow-y-auto">
      {items.map((item, index) => {
        const Icon = iconMap[item.icon] || Type;
        return (
          <button
            key={item.title}
            className={cn(
              "slash-command-item w-full text-left",
              index === selectedIndex && "is-selected bg-accent"
            )}
            onClick={() => selectItem(index)}
            onMouseEnter={() => setSelectedIndex(index)}
          >
            <div className="slash-command-item-icon">
              <Icon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-sm">{item.title}</span>
              <span className="text-xs text-muted-foreground">
                {item.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
});

SlashCommandMenu.displayName = "SlashCommandMenu";
