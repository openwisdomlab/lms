"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { SimilarNode, ConflictingHypothesis } from "@/types/database-v2";

export interface ResearchContext {
  nodeId?: string;
  nodeType?: string;
  content?: string;
  hypothesis?: string;
  selectedText?: string;
}

export interface CopilotSuggestion {
  id: string;
  type: "conflict" | "similar" | "citation" | "methodology" | "general";
  title: string;
  description: string;
  nodeId?: string;
  confidence: number;
  actionLabel?: string;
  action?: () => void;
}

export interface CopilotMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  suggestions?: CopilotSuggestion[];
  timestamp: Date;
}

interface UseResearchCopilotOptions {
  autoAnalyze?: boolean;
  analyzeDebounceMs?: number;
}

export function useResearchCopilot(options: UseResearchCopilotOptions = {}) {
  const { autoAnalyze = true, analyzeDebounceMs = 2000 } = options;

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [suggestions, setSuggestions] = useState<CopilotSuggestion[]>([]);
  const [conflicts, setConflicts] = useState<ConflictingHypothesis[]>([]);
  const [similarNodes, setSimilarNodes] = useState<SimilarNode[]>([]);
  const [context, setContext] = useState<ResearchContext>({});

  const analyzeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const supabase = createClient();

  // Update context (called when editor content changes)
  const updateContext = useCallback(
    (newContext: Partial<ResearchContext>) => {
      setContext((prev) => ({ ...prev, ...newContext }));

      // Debounce auto-analysis
      if (autoAnalyze && newContext.content) {
        if (analyzeTimeoutRef.current) {
          clearTimeout(analyzeTimeoutRef.current);
        }
        analyzeTimeoutRef.current = setTimeout(() => {
          analyzeContent(newContext.content || "");
        }, analyzeDebounceMs);
      }
    },
    [autoAnalyze, analyzeDebounceMs]
  );

  // Analyze content for conflicts and similar research
  const analyzeContent = useCallback(async (content: string) => {
    if (!content || content.length < 50) return;

    setIsAnalyzing(true);
    const newSuggestions: CopilotSuggestion[] = [];

    try {
      // In a real implementation, this would:
      // 1. Generate embedding for the content via API
      // 2. Call Supabase functions to find similar/conflicting nodes
      // 3. Use AI to analyze the hypothesis

      // Mock analysis for demonstration
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simulate finding conflicts
      if (content.toLowerCase().includes("hypothesis")) {
        newSuggestions.push({
          id: crypto.randomUUID(),
          type: "conflict",
          title: "Potential Conflict Detected",
          description:
            "Your hypothesis about Mars soil composition may conflict with recent findings in Node #A7X23. Consider reviewing before publishing.",
          nodeId: "mock-node-id",
          confidence: 0.78,
          actionLabel: "View Conflict",
        });
      }

      // Simulate finding similar research
      if (content.length > 100) {
        newSuggestions.push({
          id: crypto.randomUUID(),
          type: "similar",
          title: "Related Research Found",
          description:
            "3 researchers have published similar hypotheses. Their methodologies might inform your approach.",
          confidence: 0.65,
          actionLabel: "Explore Similar",
        });
      }

      // Methodology suggestions
      if (
        content.toLowerCase().includes("experiment") ||
        content.toLowerCase().includes("test")
      ) {
        newSuggestions.push({
          id: crypto.randomUUID(),
          type: "methodology",
          title: "Methodology Recommendation",
          description:
            "Based on your hypothesis, consider using a controlled experiment design with A/B testing.",
          confidence: 0.82,
        });
      }

      setSuggestions(newSuggestions);
    } catch (error) {
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  // Find similar nodes using vector search
  const findSimilarNodes = useCallback(
    async (embedding: number[], nodeType?: string) => {
      try {
        // This would call the Supabase function
        // const { data, error } = await supabase.rpc('search_similar_nodes', {
        //   query_embedding: embedding,
        //   match_threshold: 0.7,
        //   match_count: 10,
        //   filter_node_type: nodeType
        // });

        // Mock data
        const mockSimilar: SimilarNode[] = [
          {
            id: "1",
            title: "Mars Soil Perchlorate Study",
            node_type: "hypothesis",
            summary: "Analysis of perchlorate levels in Martian regolith",
            similarity: 0.89,
            created_by: "user-1",
            is_public: true,
          },
          {
            id: "2",
            title: "Spectroscopy Methods for Soil Analysis",
            node_type: "methodology",
            summary: "UV-Vis and IR spectroscopy protocols",
            similarity: 0.76,
            created_by: "user-2",
            is_public: true,
          },
        ];

        setSimilarNodes(mockSimilar);
        return mockSimilar;
      } catch (error) {
        console.error("Error finding similar nodes:", error);
        return [];
      }
    },
    []
  );

  // Check for conflicting hypotheses
  const checkConflicts = useCallback(async (nodeId: string) => {
    try {
      // This would call the Supabase function
      // const { data, error } = await supabase.rpc('find_conflicting_hypotheses', {
      //   p_node_id: nodeId,
      //   match_threshold: 0.75
      // });

      // Mock data
      const mockConflicts: ConflictingHypothesis[] = [
        {
          conflicting_node_id: "conflict-1",
          conflicting_title: "Alternative Mars Soil Composition Theory",
          similarity: 0.82,
          link_type: "contradicts",
          conflict_reason:
            "This hypothesis proposes a different mechanism for perchlorate formation",
        },
      ];

      setConflicts(mockConflicts);
      return mockConflicts;
    } catch (error) {
      console.error("Error checking conflicts:", error);
      return [];
    }
  }, []);

  // Send a message to the AI copilot
  const sendMessage = useCallback(
    async (userMessage: string) => {
      const userMsg: CopilotMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: userMessage,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setIsAnalyzing(true);

      try {
        // In production, this would call an AI API (e.g., OpenAI via Vercel AI SDK)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Generate contextual response based on user message and current context
        let responseContent = "";
        const responseSuggestions: CopilotSuggestion[] = [];

        if (userMessage.toLowerCase().includes("refine")) {
          responseContent =
            "Based on your current hypothesis, I suggest focusing on these key variables:\n\n" +
            "1. **Perchlorate concentration** - Your independent variable should be clearly defined with specific ranges\n" +
            "2. **Soil moisture levels** - Consider this as a controlled variable\n" +
            "3. **Temperature variations** - This could be a confounding factor\n\n" +
            "Would you like me to suggest a specific experimental design?";
        } else if (userMessage.toLowerCase().includes("conflict")) {
          responseContent =
            "I found 2 potentially conflicting hypotheses in the knowledge base. " +
            "The most significant conflict is with Node #A7X23 by Dr. Chen, which proposes a different formation mechanism. " +
            "However, your approach focuses on a different aspect that could actually complement their findings.";

          responseSuggestions.push({
            id: crypto.randomUUID(),
            type: "conflict",
            title: "Review Node #A7X23",
            description: "View the conflicting hypothesis",
            confidence: 0.85,
            actionLabel: "Open Node",
          });
        } else if (userMessage.toLowerCase().includes("method")) {
          responseContent =
            "For testing your hypothesis about Mars soil composition, I recommend:\n\n" +
            "**Recommended Methodology:**\n" +
            "- Use UV-Vis spectroscopy for initial analysis\n" +
            "- Follow with X-ray diffraction for mineral identification\n" +
            "- Include control samples from Earth analogues (Atacama Desert)\n\n" +
            "This approach has been validated in 12 previous studies in the knowledge base.";
        } else {
          responseContent =
            "I'm here to help with your research! I can:\n\n" +
            "- **Analyze** your hypothesis for potential conflicts\n" +
            "- **Suggest** related research and methodologies\n" +
            "- **Review** your experimental design\n" +
            "- **Find** citations and supporting evidence\n\n" +
            "What aspect would you like to focus on?";
        }

        const assistantMsg: CopilotMessage = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: responseContent,
          suggestions: responseSuggestions,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      } catch (error) {
        console.error("Copilot error:", error);
      } finally {
        setIsAnalyzing(false);
      }
    },
    [context]
  );

  // Analyze selected text
  const analyzeSelection = useCallback(
    async (selectedText: string) => {
      updateContext({ selectedText });

      const selectionSuggestions: CopilotSuggestion[] = [];

      // Check if selection looks like a hypothesis
      if (
        selectedText.length > 20 &&
        (selectedText.includes("if") ||
          selectedText.includes("then") ||
          selectedText.includes("hypothesis"))
      ) {
        selectionSuggestions.push({
          id: crypto.randomUUID(),
          type: "general",
          title: "Evaluate Hypothesis",
          description:
            "AI can evaluate this hypothesis for testability and suggest improvements",
          confidence: 0.9,
          actionLabel: "Evaluate",
        });
      }

      // Check if it looks like a citation opportunity
      if (selectedText.match(/\b(study|research|found|showed|demonstrated)\b/i)) {
        selectionSuggestions.push({
          id: crypto.randomUUID(),
          type: "citation",
          title: "Find Supporting Research",
          description:
            "Search the knowledge base for research that supports this claim",
          confidence: 0.75,
          actionLabel: "Find Citations",
        });
      }

      if (selectionSuggestions.length > 0) {
        setSuggestions((prev) => [...selectionSuggestions, ...prev]);
      }
    },
    [updateContext]
  );

  // Clear all suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
  }, []);

  // Clear chat history
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (analyzeTimeoutRef.current) {
        clearTimeout(analyzeTimeoutRef.current);
      }
    };
  }, []);

  return {
    // State
    isAnalyzing,
    messages,
    suggestions,
    conflicts,
    similarNodes,
    context,

    // Actions
    updateContext,
    analyzeContent,
    findSimilarNodes,
    checkConflicts,
    sendMessage,
    analyzeSelection,
    clearSuggestions,
    clearMessages,
  };
}

export default useResearchCopilot;
