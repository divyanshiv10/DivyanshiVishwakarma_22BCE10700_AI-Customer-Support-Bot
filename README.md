# AI Customer Support Bot

An AI-powered customer support chatbot built with React (Vite) and Supabase, capable of handling FAQs, maintaining contextual memory, and simulating escalation when unable to answer.  
This project demonstrates how AI can automate support interactions with real-time LLM integration and session management.

---

## Features

- Interactive chat interface built using React and Tailwind CSS  
- Contextual memory to maintain previous chat history  
- Supabase backend for message and session tracking  
- AI-driven replies generated using LLM  
- Escalation simulation for queries that cannot be answered  
- Structured and maintainable codebase  

---

## Tech Stack

| Layer | Technology Used |
|-------|------------------|
| Frontend | React + TypeScript + Vite |
| Styling | Tailwind CSS |
| Backend | Supabase (Edge Functions + Database) |
| AI Integration | LLM |
| Build Tool | Vite |
| Deployment Options | Supabase Hosting or Vercel |

---

## Project Structure

project/  
├── src/  
│ ├── components/  
│ │ ├── ChatInput.tsx  
│ │ ├── ChatMessage.tsx  
│ │ ├── ChatWindow.tsx  
│ │ └── EscalationBanner.tsx  
│ ├── hooks/  
│ │ └── useChat.ts  
│ ├── lib/  
│ │ └── supabase.ts  
│ ├── types/  
│ │ └── index.ts  
│ ├── App.tsx  
│ ├── main.tsx  
│ └── index.css  
│  
├── supabase/  
│ ├── functions/  
│ │ └── chat-support/  
│ │ └── index.ts  
│ └── migrations/  
│ └── 20251016134609_create_support_bot_schema.sql  
│  
├── .bolt/  
│ ├── config.json  
│ └── prompt  
│  
├── package.json  
├── vite.config.ts  
├── tailwind.config.js  
├── postcss.config.js  
├── tsconfig.json  
├── .env  
└── index.html  

---

## Setup and Installation

### Step 1: Clone Repository
```bash
git clone https://github.com/divyanshiv10/DivyanshiVishwakarma_22BCE10700_AI-Customer-Support-Bot.git
cd ai-customer-support-bot/project
Step 2: Install Dependencies
npm install

Step 3: Configure Environment Variables

Create a .env file in the project/ directory:

VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>

Step 4: Start Development Server
npm run dev


Then open: http://localhost:5173

Supabase Function (Backend)

Path: supabase/functions/chat-support/index.ts

Handles:

Sending customer queries to the LLM

Retrieving FAQ or contextual information

Returning AI-generated responses

Storing chat history and sessions in Supabase

Database Schema

File: supabase/migrations/20251016134609_create_support_bot_schema.sql

Tables:

sessions — Tracks user chat sessions

messages — Logs messages with timestamps and sender info

API Endpoints
Method	Endpoint	Description
POST	/chat	Sends a customer query and returns AI response
GET	/session/:id	Retrieves chat history for a session
POST	/escalate	Simulates escalation if query unresolved

MADE BY DIVYANSHI VISHWAKARMA 