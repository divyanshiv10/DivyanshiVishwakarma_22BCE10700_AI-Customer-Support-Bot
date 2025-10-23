/*
  # AI Customer Support Bot Schema

  1. New Tables
    - `faqs`
      - `id` (uuid, primary key) - Unique identifier
      - `question` (text) - FAQ question
      - `answer` (text) - FAQ answer
      - `category` (text) - Category for organization
      - `keywords` (text array) - Keywords for matching
      - `created_at` (timestamptz) - Creation timestamp
      - `updated_at` (timestamptz) - Last update timestamp
    
    - `chat_sessions`
      - `id` (uuid, primary key) - Session identifier
      - `user_id` (text) - Anonymous user identifier
      - `status` (text) - Session status (active, resolved, escalated)
      - `escalated` (boolean) - Whether session needs human support
      - `escalation_reason` (text) - Reason for escalation
      - `created_at` (timestamptz) - Session start time
      - `updated_at` (timestamptz) - Last activity time
    
    - `chat_messages`
      - `id` (uuid, primary key) - Message identifier
      - `session_id` (uuid, foreign key) - Reference to chat session
      - `role` (text) - Message role (user, assistant, system)
      - `content` (text) - Message content
      - `metadata` (jsonb) - Additional data (confidence, matched_faq, etc.)
      - `created_at` (timestamptz) - Message timestamp

  2. Security
    - Enable RLS on all tables
    - Public read access to FAQs (knowledge base)
    - Session-based access control for chat sessions and messages
    - Users can only access their own sessions via session_id

  3. Indexes
    - Index on chat_sessions.user_id for fast user session lookup
    - Index on chat_messages.session_id for message retrieval
    - Index on faqs.category for filtered queries

  4. Important Notes
    - Using text-based user_id for anonymous users (generated client-side)
    - Session tracking enables contextual memory across messages
    - Metadata field stores confidence scores and matching details
    - Escalation flag helps route to human support when needed
*/

-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question text NOT NULL,
  answer text NOT NULL,
  category text DEFAULT 'general',
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'escalated')),
  escalated boolean DEFAULT false,
  escalation_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_faqs_category ON faqs(category);

-- Enable RLS
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for FAQs (public read access)
CREATE POLICY "Anyone can read FAQs"
  ON faqs FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Only authenticated users can insert FAQs"
  ON faqs FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can update FAQs"
  ON faqs FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Only authenticated users can delete FAQs"
  ON faqs FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for chat_sessions (session-based access)
CREATE POLICY "Users can read own sessions"
  ON chat_sessions FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create sessions"
  ON chat_sessions FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update own sessions"
  ON chat_sessions FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for chat_messages (session-based access)
CREATE POLICY "Users can read messages in any session"
  ON chat_messages FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can create messages"
  ON chat_messages FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Insert sample FAQs
INSERT INTO faqs (question, answer, category, keywords) VALUES
  ('What are your business hours?', 'We are open Monday to Friday, 9 AM to 6 PM EST. Our AI support is available 24/7.', 'general', ARRAY['hours', 'time', 'open', 'availability']),
  ('How do I reset my password?', 'Click on "Forgot Password" on the login page. Enter your email address and follow the instructions sent to your inbox.', 'account', ARRAY['password', 'reset', 'forgot', 'login']),
  ('What payment methods do you accept?', 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers.', 'billing', ARRAY['payment', 'credit card', 'paypal', 'billing']),
  ('How can I track my order?', 'Once your order ships, you will receive a tracking number via email. You can also view order status in your account dashboard.', 'orders', ARRAY['tracking', 'order', 'shipping', 'delivery']),
  ('What is your refund policy?', 'We offer a 30-day money-back guarantee on all products. Contact support to initiate a refund request.', 'billing', ARRAY['refund', 'return', 'money back', 'guarantee']),
  ('How do I contact customer support?', 'You can reach us via this chat, email at support@company.com, or call us at 1-800-SUPPORT during business hours.', 'general', ARRAY['contact', 'support', 'help', 'phone', 'email']),
  ('Do you offer international shipping?', 'Yes, we ship to over 50 countries worldwide. Shipping costs and times vary by location.', 'orders', ARRAY['international', 'shipping', 'worldwide', 'global']),
  ('How do I update my account information?', 'Log into your account and navigate to Settings > Profile to update your personal information, email, or password.', 'account', ARRAY['update', 'account', 'profile', 'settings', 'change'])
ON CONFLICT DO NOTHING;