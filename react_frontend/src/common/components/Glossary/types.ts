export interface GlossaryItem {
  term: string;
  definition: string;
  references?: Record<string, { url: string; text?: string }>;
}
