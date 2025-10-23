import { createClient } from 'npm:@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

interface ChatRequest {
  sessionId?: string;
  userId: string;
  message: string;
}

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
}

interface Message {
  role: string;
  content: string;
}

// Simple keyword matching with scoring
function findBestFAQMatch(query: string, faqs: FAQ[]): { faq: FAQ | null; confidence: number } {
  const queryLower = query.toLowerCase();
  const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
  
  let bestMatch: FAQ | null = null;
  let bestScore = 0;
  
  for (const faq of faqs) {
    let score = 0;
    
    // Check question similarity
    if (faq.question.toLowerCase().includes(queryLower)) {
      score += 10;
    }
    
    // Check keyword matches
    for (const keyword of faq.keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 5;
      }
    }
    
    // Check individual word matches
    for (const word of queryWords) {
      if (faq.question.toLowerCase().includes(word) || 
          faq.answer.toLowerCase().includes(word) ||
          faq.keywords.some(k => k.toLowerCase().includes(word))) {
        score += 1;
      }
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestMatch = faq;
    }
  }
  
  // Normalize confidence score (0-1 range)
  const confidence = Math.min(bestScore / 15, 1);
  
  return { faq: bestMatch, confidence };
}

// Generate contextual response using conversation history
function generateContextualResponse(
  query: string,
  matchedFAQ: FAQ | null,
  confidence: number,
  conversationHistory: Message[]
): { response: string; shouldEscalate: boolean; reason?: string } {
  const CONFIDENCE_THRESHOLD = 0.3;
  const ESCALATION_KEYWORDS = ['complaint', 'angry', 'upset', 'frustrated', 'terrible', 'awful', 'disappointed', 'speak to manager', 'human', 'real person'];
  
  // Check for escalation keywords
  const queryLower = query.toLowerCase();
  const hasEscalationKeyword = ESCALATION_KEYWORDS.some(kw => queryLower.includes(kw));
  
  // Check if question is too complex (many words, multiple questions)
  const wordCount = query.split(/\s+/).length;
  const questionCount = (query.match(/\?/g) || []).length;
  const isComplex = wordCount > 30 || questionCount > 2;
  
  // Count unanswered attempts in conversation
  const recentMessages = conversationHistory.slice(-4);
  const lowConfidenceCount = recentMessages.filter(m => 
    m.role === 'assistant' && m.content.includes('not sure')
  ).length;
  
  // Determine if escalation is needed
  if (hasEscalationKeyword) {
    return {
      response: "I understand you'd like to speak with a human representative. Let me connect you with our support team who can better assist you with this matter.",
      shouldEscalate: true,
      reason: 'User requested human support'
    };
  }
  
  if (lowConfidenceCount >= 2) {
    return {
      response: "I apologize, but I'm having difficulty providing the information you need. Let me escalate this to our support team who can give you more detailed assistance.",
      shouldEscalate: true,
      reason: 'Multiple low-confidence responses'
    };
  }
  
  if (isComplex && confidence < CONFIDENCE_THRESHOLD) {
    return {
      response: "Your question involves several topics that would be best addressed by our support team. I'm escalating this conversation so a representative can provide comprehensive assistance.",
      shouldEscalate: true,
      reason: 'Complex multi-part question'
    };
  }
  
  // Generate response based on FAQ match
  if (matchedFAQ && confidence >= CONFIDENCE_THRESHOLD) {
    // Add conversational context if there's history
    let contextPrefix = '';
    if (conversationHistory.length > 0) {
      const lastUserMessage = conversationHistory.filter(m => m.role === 'user').slice(-1)[0];
      if (lastUserMessage && lastUserMessage.content.toLowerCase() !== query.toLowerCase()) {
        contextPrefix = "Based on your question, ";
      }
    }
    
    return {
      response: `${contextPrefix}${matchedFAQ.answer}\n\nIs there anything else I can help you with?`,
      shouldEscalate: false
    };
  }
  
  // Low confidence response
  return {
    response: "I'm not sure I fully understand your question. Could you please rephrase it or provide more details? Alternatively, I can connect you with our support team for more specific assistance.",
    shouldEscalate: false
  };
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }
  
  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
    
    const { sessionId, userId, message }: ChatRequest = await req.json();
    
    if (!userId || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Get or create session
    let currentSessionId = sessionId;
    if (!currentSessionId) {
      const { data: newSession, error: sessionError } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId, status: 'active' })
        .select('id')
        .single();
      
      if (sessionError) throw sessionError;
      currentSessionId = newSession.id;
    }
    
    // Store user message
    await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'user',
        content: message,
      });
    
    // Get conversation history for context
    const { data: history } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('session_id', currentSessionId)
      .order('created_at', { ascending: true })
      .limit(10);
    
    const conversationHistory: Message[] = history || [];
    
    // Get all FAQs
    const { data: faqs } = await supabase
      .from('faqs')
      .select('*');
    
    // Find best FAQ match
    const { faq: matchedFAQ, confidence } = findBestFAQMatch(message, faqs || []);
    
    // Generate contextual response
    const { response, shouldEscalate, reason } = generateContextualResponse(
      message,
      matchedFAQ,
      confidence,
      conversationHistory
    );
    
    // Store assistant response
    const { data: assistantMessage } = await supabase
      .from('chat_messages')
      .insert({
        session_id: currentSessionId,
        role: 'assistant',
        content: response,
        metadata: {
          confidence,
          matched_faq_id: matchedFAQ?.id,
          matched_faq_category: matchedFAQ?.category,
        },
      })
      .select()
      .single();
    
    // Handle escalation
    if (shouldEscalate) {
      await supabase
        .from('chat_sessions')
        .update({
          status: 'escalated',
          escalated: true,
          escalation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentSessionId);
    } else {
      // Update session timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', currentSessionId);
    }
    
    return new Response(
      JSON.stringify({
        sessionId: currentSessionId,
        message: assistantMessage,
        escalated: shouldEscalate,
        confidence,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});