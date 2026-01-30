export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  id?: string;
}

export type Model =
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'meta-llama-3.1-70b-instruct'
  | 'mistral-large';
