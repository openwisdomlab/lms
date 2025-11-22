export { ScienceEditor } from "./science-editor";
export type { ScienceEditorProps } from "./science-editor";
export { AIBlock } from "./extensions/ai-block";
export { Citation } from "./extensions/citation";
export { SlashCommand, defaultSlashCommands } from "./extensions/slash-command";
export {
  HypothesisBlock,
  MethodologyBlock,
  DataBlock,
  ConclusionBlock,
  ChartBlock,
  scientificExtensions,
} from "./extensions/scientific-blocks";

// Enhanced scientific blocks with NodeView renderers
export {
  EnhancedHypothesisBlock,
  EnhancedMethodologyBlock,
  EnhancedDataBlock,
  EnhancedConclusionBlock,
  EvidenceLinkBlock,
  enhancedScientificExtensions,
} from "./extensions/enhanced-scientific-blocks";

// NodeView components
export {
  HypothesisNodeView,
  MethodologyNodeView,
  DataNodeView,
  ConclusionNodeView,
} from "./node-views";
