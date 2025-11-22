"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RotateCcw, GitCompare, Clock, User } from "lucide-react";

interface Version {
  id: string;
  version_number: number;
  change_message: string | null;
  change_type: string;
  created_at: string;
  created_by: { display_name: string };
}

interface VersionHistoryProps {
  versions: Version[];
  currentVersion: number;
  onRestore?: (versionId: string) => void;
  onCompare?: (versionId: string) => void;
}

export function VersionHistory({
  versions,
  currentVersion,
  onRestore,
  onCompare,
}: VersionHistoryProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const changeTypeColors: Record<string, string> = {
    major: "bg-red-500/10 text-red-600 border-red-500/30",
    minor: "bg-blue-500/10 text-blue-600 border-blue-500/30",
    patch: "bg-gray-500/10 text-gray-600 border-gray-500/30",
  };

  return (
    <div className="version-timeline p-4">
      {versions.map((version) => {
        const isCurrent = version.version_number === currentVersion;

        return (
          <div
            key={version.id}
            className={cn("version-item", isCurrent && "is-current")}
          >
            <div className="space-y-2">
              {/* Version header */}
              <div className="flex items-center gap-2">
                <span className="font-semibold">v{version.version_number}</span>
                <Badge
                  variant="outline"
                  className={cn("text-xs", changeTypeColors[version.change_type])}
                >
                  {version.change_type}
                </Badge>
                {isCurrent && (
                  <Badge variant="default" className="text-xs">
                    Current
                  </Badge>
                )}
              </div>

              {/* Change message */}
              <p className="text-sm text-muted-foreground">
                {version.change_message || "No description"}
              </p>

              {/* Meta */}
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3" />
                  {version.created_by.display_name}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(version.created_at)}
                </span>
              </div>

              {/* Actions */}
              {!isCurrent && (
                <div className="flex items-center gap-2 pt-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onCompare?.(version.id)}
                  >
                    <GitCompare className="w-3 h-3 mr-1" />
                    Compare
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onRestore?.(version.id)}
                  >
                    <RotateCcw className="w-3 h-3 mr-1" />
                    Restore
                  </Button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
