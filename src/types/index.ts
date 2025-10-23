export interface Message {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    confidence?: number;
    matched_faq_id?: string;
    matched_faq_category?: string;
  };
  created_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  status: 'active' | 'resolved' | 'escalated';
  escalated: boolean;
  escalation_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  created_at: string;
  updated_at: string;
}
