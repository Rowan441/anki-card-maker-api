export type Deck = {
  id: number;
  name: string;
  source_language: string;
  target_language: string;
  created_at: string;
  updated_at: string;
};

export type DeckCreatePayload = {
  name: string;
  source_language: string;
  target_language: string;
};

export type DeckUpdatePayload = {
  name?: string;
  source_language?: string;
  target_language?: string;
};
