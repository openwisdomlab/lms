"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ActiveCollaborator } from "@/types/database-v2";

interface CollaborationCursorsProps {
  collaborators: ActiveCollaborator[];
  className?: string;
}

export function CollaborationCursors({
  collaborators,
  className,
}: CollaborationCursorsProps) {
  if (collaborators.length === 0) return null;

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-1 ${className}`}>
        <span className="text-xs text-muted-foreground mr-1">
          {collaborators.length} editing
        </span>
        <div className="flex -space-x-2">
          {collaborators.slice(0, 5).map((collaborator) => (
            <Tooltip key={collaborator.user_id}>
              <TooltipTrigger asChild>
                <Avatar
                  className="w-7 h-7 border-2 border-background cursor-pointer"
                  style={{ borderColor: collaborator.color }}
                >
                  <AvatarImage src={collaborator.avatar_url || undefined} />
                  <AvatarFallback
                    className="text-[10px]"
                    style={{ backgroundColor: collaborator.color, color: "white" }}
                  >
                    {collaborator.display_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </TooltipTrigger>
              <TooltipContent>
                <p>{collaborator.display_name}</p>
                {collaborator.cursor_position && (
                  <p className="text-xs text-muted-foreground">
                    Line {collaborator.cursor_position.line}
                  </p>
                )}
              </TooltipContent>
            </Tooltip>
          ))}
          {collaborators.length > 5 && (
            <div
              className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background"
            >
              +{collaborators.length - 5}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

// Cursor overlay component for showing other users' cursors in the editor
interface CursorOverlayProps {
  collaborators: ActiveCollaborator[];
  getPositionFromCoords: (line: number, column: number) => { x: number; y: number } | null;
}

export function CursorOverlay({
  collaborators,
  getPositionFromCoords,
}: CursorOverlayProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {collaborators.map((collaborator) => {
        if (!collaborator.cursor_position) return null;

        const position = getPositionFromCoords(
          collaborator.cursor_position.line,
          collaborator.cursor_position.column
        );

        if (!position) return null;

        return (
          <div
            key={collaborator.user_id}
            className="collaborator-cursor"
            style={{
              left: position.x,
              top: position.y,
              backgroundColor: collaborator.color,
            }}
            data-name={collaborator.display_name}
          />
        );
      })}
    </div>
  );
}

// Selection highlight component
interface SelectionHighlightProps {
  collaborators: ActiveCollaborator[];
  getSelectionCoords: (
    start: { line: number; column: number },
    end: { line: number; column: number }
  ) => Array<{ x: number; y: number; width: number; height: number }> | null;
}

export function SelectionHighlight({
  collaborators,
  getSelectionCoords,
}: SelectionHighlightProps) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {collaborators.map((collaborator) => {
        if (!collaborator.cursor_position?.selection) return null;

        const { start, end } = collaborator.cursor_position.selection;
        const rects = getSelectionCoords(start, end);

        if (!rects) return null;

        return rects.map((rect, i) => (
          <div
            key={`${collaborator.user_id}-${i}`}
            className="collaborator-selection"
            style={{
              left: rect.x,
              top: rect.y,
              width: rect.width,
              height: rect.height,
              backgroundColor: collaborator.color,
            }}
          />
        ));
      })}
    </div>
  );
}
