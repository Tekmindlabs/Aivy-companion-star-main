export interface Message {
  id: string;  // Remove optional
  content: string;
  role: 'user' | 'assistant';
  createdAt: Date;  // Change to Date type
}

export interface ChatResponse {
  success: boolean;
  message?: Message;
  error?: string;
}