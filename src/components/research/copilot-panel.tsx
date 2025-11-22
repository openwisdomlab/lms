"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  AlertTriangle,
  Lightbulb,
  BookOpen,
  Send,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { CopilotSuggestion, CopilotMessage } from "@/hooks/use-research-copilot";

interface CopilotPanelProps {
  copilot: {
    isAnalyzing: boolean;
    messages: CopilotMessage[];
    suggestions: CopilotSuggestion[];
    sendMessage: (message: string) => Promise<void>;
    clearSuggestions: () => void;
  };
  onClose: () => void;
}

const suggestionIcons: Record<string, React.ElementType> = {
  conflict: AlertTriangle,
  similar: BookOpen,
  citation: BookOpen,
  methodology: Lightbulb,
  general: Sparkles,
};

const suggestionColors: Record<string, string> = {
  conflict: "border-red-500/30 bg-red-500/5",
  similar: "border-blue-500/30 bg-blue-500/5",
  citation: "border-green-500/30 bg-green-500/5",
  methodology: "border-amber-500/30 bg-amber-500/5",
  general: "border-violet-500/30 bg-violet-500/5",
};

export function CopilotPanel({ copilot, onClose }: CopilotPanelProps) {
  const [inputMessage, setInputMessage] = useState("");

  const handleSend = async () => {
    if (!inputMessage.trim()) return;
    await copilot.sendMessage(inputMessage);
    setInputMessage("");
  };

  return (
    <div className="w-96 border-l bg-background flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">Research Copilot</h3>
            {copilot.isAnalyzing && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" />
                Analyzing...
              </span>
            )}
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Suggestions */}
          {copilot.suggestions.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">AI Suggestions</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={copilot.clearSuggestions}
                >
                  Clear all
                </Button>
              </div>

              {copilot.suggestions.map((suggestion) => {
                const Icon = suggestionIcons[suggestion.type] || Sparkles;

                return (
                  <div
                    key={suggestion.id}
                    className={cn(
                      "p-3 rounded-lg border",
                      suggestionColors[suggestion.type]
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">
                            {suggestion.title}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.description}
                        </p>
                        {suggestion.actionLabel && (
                          <Button
                            variant="link"
                            size="sm"
                            className="h-6 px-0 text-xs mt-1"
                          >
                            {suggestion.actionLabel} →
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Chat Messages */}
          {copilot.messages.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Conversation</h4>

              {copilot.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-3",
                    message.role === "user" && "flex-row-reverse"
                  )}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-lg p-3 max-w-[85%]",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                    {/* Inline suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-2 pt-2 border-t border-border/50 space-y-2">
                        {message.suggestions.map((s) => (
                          <Button
                            key={s.id}
                            variant="secondary"
                            size="sm"
                            className="w-full justify-start text-xs h-7"
                          >
                            {s.title}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {copilot.suggestions.length === 0 && copilot.messages.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <h4 className="font-medium mb-1">Research Copilot</h4>
              <p className="text-sm text-muted-foreground">
                I&apos;m analyzing your research. Ask me about your hypothesis,
                methodology, or related work.
              </p>
            </div>
          )}

          {/* Quick prompts */}
          {copilot.messages.length === 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "Refine my hypothesis",
                  "Find conflicts",
                  "Suggest methods",
                ].map((prompt) => (
                  <Button
                    key={prompt}
                    variant="outline"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => copilot.sendMessage(prompt)}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            placeholder="Ask about your research..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            disabled={copilot.isAnalyzing}
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={copilot.isAnalyzing || !inputMessage.trim()}
          >
            {copilot.isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
