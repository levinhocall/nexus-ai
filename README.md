# ⬡ NEXUS — Neural EXecution & Understanding System

> You are not talking to a chatbot. You are interfacing with an AI Operating System.

## Stack
- **Runtime**: Node.js + Express
- **AI**: Groq API (LLaMA 3.3 70B)
- **Deploy**: Render
- **Memory**: JSON (short-term + long-term profiles)

## Architecture

```
User Input
  → Intent Engine (COMMAND / QUERY / TASK / AUTOMATION / MEMORY / SYSTEM)
  → Memory Injection (short-term + user profile)
  → Tool Execution (weather / news / calculate / imageGen)
  → Agent Selection (assistant / coder / research / planner / executor / controller)
  → AI Response (Groq LLaMA)
  → Memory Update
  → Output
```

## Setup

```bash
npm install
cp .env.example .env
# Add your API keys to .env
npm start
```

## Environment Variables

```
GROQ_API_KEY=        # Required — get from console.groq.com
WEATHER_API_KEY=     # Optional — openweathermap.org
NEWS_API_KEY=        # Optional — newsapi.org
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/chat` | Main chat endpoint |
| GET | `/api/status` | System status |
| POST | `/api/memory/clear` | Clear user memory |
| GET | `/api/memory/:userId` | Get user memory |

## Agents

| Agent | Purpose |
|-------|---------|
| assistant | General tasks, conversation |
| coder | Code generation, debugging |
| research | Deep information, analysis |
| planner | Roadmaps, task planning |
| executor | Multi-step task execution |
| controller | System management |
