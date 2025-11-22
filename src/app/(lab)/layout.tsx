"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { RightPanel } from "@/components/layout/right-panel";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />

          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-6 py-6">{children}</div>
          </main>
        </div>

        {/* Right Panel (AI Assistant / Graph) */}
        <RightPanel
          isOpen={isRightPanelOpen}
          onClose={() => setIsRightPanelOpen(false)}
        />

        {/* Floating AI Button */}
        {!isRightPanelOpen && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700"
                onClick={() => setIsRightPanelOpen(true)}
              >
                <Sparkles className="w-6 h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">Open AI Assistant</TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
