📘 AI Tutor – Interactive Learning Assistant

An AI-powered study tutor built using Next.js, React, and Google Gemini, designed to help students learn concepts interactively through real-time conversations, multiple teaching modes, and structured explanations.

The application provides a modern chat-based learning experience with streaming AI responses, adaptive tutoring styles, and a clean, responsive interface.

✨ Features

🤖 AI-powered tutor using Google Gemini

💬 Real-time streaming responses (ChatGPT-like experience)

🎓 Multiple tutor modes:

Explain

Socratic

Revision

Exam-focused

🧠 Context-aware conversation handling

📝 Notes panel for structured learning

⚡ Fast and responsive UI

🌙 Light/Dark theme support

⌨️ Keyboard shortcuts for productivity

📱 Fully responsive design

🔒 Secure API handling using environment variables

🛠️ Tech Stack
Frontend

React (TypeScript)

Next.js (App Router)

Tailwind CSS

ShadCN UI

Framer Motion

Backend

Next.js API Routes

Server-side streaming responses

Google Gemini API (gemini-1.5-flash)

State & Utilities

React Hooks

Custom session store

AbortController for request cancellation

📂 Project Structure (Simplified)
app/
 ├── api/
 │   └── chat/
 │       └── stream/
 │           └── route.ts
 ├── layout.tsx
 └── page.tsx

components/
 ├── tutor-interface-v2.tsx
 ├── chat/
 ├── notes/
 └── ui/

store/
 └── session-store.ts

🚀 Getting Started
1️⃣ Clone the repository
git clone https://github.com/Kuljot234/TUTOR_CHAT_BOT.git
cd TUTOR_CHAT_BOT

2️⃣ Install dependencies
npm install

3️⃣ Create environment file

Create a .env.local file in the root:

GEMINI_API_KEY=your_api_key_here


⚠️ Never commit your API key.

4️⃣ Run the project
npm run dev


Open in browser:

http://localhost:3000

🧠 How It Works

User sends a message from the UI

Frontend calls /api/chat/stream

Backend sends the prompt to Gemini

Gemini streams text chunks

UI renders responses in real time

Session context is maintained

📌 Example Use Cases

Learning programming concepts

Exam preparation

Concept revision

Step-by-step explanations

Self-study assistance

Interactive tutoring

🧪 Testing

Includes unit and integration tests for:

Components

Store logic

User interaction flows

Run tests:

npm test

🌱 Future Improvements

User authentication

Persistent chat history

File & PDF uploads

Voice input/output

Quiz generation

Progress tracking

Deployment with analytics

Multi-language support

👨‍💻 Author

Kuljot Singh
B.Tech Computer Science
Passionate about Full-Stack & AI Development
