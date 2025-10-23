# 🤖 AI Customer Support Bot

An AI-powered customer support chatbot built with **React (Vite)** and **Supabase**, capable of handling FAQs, maintaining contextual memory, and simulating escalation when unable to answer.  
This project demonstrates how AI can automate support interactions with real-time LLM integration and session management.

---

## 🚀 Features
- 💬 Interactive chat interface built using React + Tailwind CSS  
- 🧠 Contextual memory to maintain previous chat history  
- ⚙️ Supabase backend for message & session tracking  
- 🤖 AI-driven replies generated using LLM  
- ⚠️ Escalation simulation for queries that cannot be answered  
- 📊 Structured and maintainable codebase  

---

## 🧰 Tech Stack

| Layer | Technology Used |
|-------|------------------|
| **Frontend** | React + TypeScript + Vite |
| **Styling** | Tailwind CSS |
| **Backend** | Supabase (Edge Functions + Database) |
| **AI Integration** | LLM |
| **Build Tool** | Vite |
| **Deployment Options** | Supabase Hosting, or Vercel |

---

## 📁 Project Structure

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

## ⚙️ Setup & Installation

### 1️⃣ Clone Repository
```bash
git clone https://github.com/RiddhikaTripathi/AI_CS_Bot.git
cd ai-customer-support-bot/project
```

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Configure Environment Variables
Create a .env file in the project/ directory:
```bash
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```
### 4️⃣ Start Development Server
```bash
npm run dev
```
Now open: http://localhost:5173

---

## 🧩 Supabase Function (Backend)

- Path: supabase/functions/chat-support/index.ts
- Handles:
  > Sending customer queries to the LLM
  > Retrieving FAQ or contextual information
  > Returning AI-generated responses
  > Storing chat history and sessions in Supabase

---

## 🗄️ Database Schema

- File: supabase/migrations/20251016134609_create_support_bot_schema.sql
- Tables:
  > sessions — Tracks user chat sessions
  > messages — Logs messages with timestamps and sender info

---

## 🧪 API Endpoints

| Method   | Endpoint       | Description                                    |
| -------- | -------------- | ---------------------------------------------- |
| **POST** | `/chat`        | Sends a customer query and returns AI response |
| **GET**  | `/session/:id` | Retrieves chat history for a session           |
| **POST** | `/escalate`    | Simulates escalation if query unresolved       |

---

## 💬 Final Thoughts

Thanks for checking out this project!  
If you find it useful, ⭐ star the repo and share your feedback — every suggestion helps improve it.

---

### 👩‍💻 Built by **Riddhika Tripathi**
