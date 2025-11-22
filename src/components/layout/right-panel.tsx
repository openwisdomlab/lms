"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Network,
  MessageSquare,
  Send,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

interface RightPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RightPanel({ isOpen, onClose }: RightPanelProps) {
  const [aiMessage, setAiMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!aiMessage.trim()) return;
    setIsLoading(true);
    // Simulate AI response
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setAiMessage("");
  };

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-96 bg-background border-l shadow-lg transition-transform duration-300 z-50",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}
    >
      {/* Header */}
      <div className="h-14 border-b flex items-center justify-between px-4">
        <h2 className="font-semibold">Research Assistant</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <Tabs defaultValue="ai" className="h-[calc(100%-3.5rem)]">
        <TabsList className="w-full justify-start px-4 pt-2">
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Copilot
          </TabsTrigger>
          <TabsTrigger value="graph" className="gap-2">
            <Network className="w-4 h-4" />
            Graph
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="h-[calc(100%-3rem)] flex flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {/* AI Introduction */}
              <div className="bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-lg p-4 border border-violet-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-medium">Research AI</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  I&apos;m your AI research assistant. I can help you:
                </p>
                <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                  <li>• Evaluate hypotheses</li>
                  <li>• Find related research</li>
                  <li>• Suggest methodologies</li>
                  <li>• Summarize findings</li>
                </ul>
              </div>

              {/* Sample Conversation */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 text-sm">
                    Can you help me refine my hypothesis about Mars soil
                    composition?
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-violet-500/10 border border-violet-500/20 rounded-lg p-3 text-sm">
                    I&apos;d be happy to help! Based on your current hypothesis, I
                    suggest focusing on perchlorate levels. Recent studies from
                    the Phoenix mission show...
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                placeholder="Ask about your research..."
                value={aiMessage}
                onChange={(e) => setAiMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                disabled={isLoading}
              />
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={isLoading || !aiMessage.trim()}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="graph" className="h-[calc(100%-3rem)]">
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center">
              <Network className="w-12 h-12 mx-auto text-muted-foreground/50 mb-3" />
              <h3 className="font-medium mb-1">Knowledge Graph</h3>
              <p className="text-sm text-muted-foreground">
                Visualize connections between your research nodes. Select a node
                to see its relationships.
              </p>
              <Button variant="outline" className="mt-4">
                Open Full Graph View
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
