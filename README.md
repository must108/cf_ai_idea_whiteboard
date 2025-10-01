# Idea Whiteboard

An **AI-powered whiteboarding application** built on **Cloudflare workers**.

Users can add sticky notes in realtime, upvote ideas, and generate AI summaries that summarize themes and suggest next steps for your team.

View the app [here](https://idea-whiteboard.mustaeen18-b19.workers.dev/)!

This project satifies the following requirements:
* **LLM** - uses Llama 3.3 on **Workers AI** for summarizing text
* **Workflow/Coordination** - A **Durable Object** (`Idearoom`) handles room state and coordination
* **User Input** - Users enter notes via text input, through a frontend hosted on [**Cloudflare Pages**](https://idea-whiteboard.mustaeen18-b19.workers.dev/).
* **Memory/State** - **Durable Object** state, **Cloudflare D1** for persistence, and **Vectorize** for semantic memory.

### Components
* Frontend, built with Next.js
* Backend, built with **Cloudflare Workers** and a **Durable Object**.
  * Notes are stored in state and D1
  * Updates are streamed to clients through **Websockets**
  * **Workers AI** for note summarization
  * **Note embeddings** are saved in **Cloudflare Vectorize** and use **BAAI General Embedding Model**.

### File Structure
```
cf_ai_idea_whiteboard/
├── README.md
├── PROMPTS.md
├── .dev.vars               # Local env vars
├── package.json            # Frontend scripts
├── wrangler.json           # Frontend wrangler config
├── backend/                # Backend Worker + Durable Object
│   ├── wrangler.toml
│   ├── src/
│   │   ├── index.ts         # Worker entrypoint
│   │   ├── ideaRoom.ts      # Durable Object (rooms, notes, sockets)
│   │   ├── summarize.ts     # AI summarization logic
│   │   ├── db/schema.sql    # D1 schema
│   │   └── types.ts
└── src/
    ├── app/                 # Pages + API routes
    ├── components/
    ├── hooks/               # Realtime WebSocket hook
    └── types/
```

## Running Locally

* This application is also viewable through [**Cloudflare Pages**](https://idea-whiteboard.mustaeen18-b19.workers.dev/)!

* When running `wrangler`, you can also opt to use your preferred runtime to fetch and download instead.
  * Ex. `npx wrangler`, `bunx wrangler`, `pnpx wrangler`.

### Prerequisites
* `Node.js` 18+
* Wrangler CLI
* Cloudflare account, with Workers AI, D1, and Vectorize enabled.

**Be sure to run the backend/frontend on different terminals!**

### Run Backend
```bash
cd backend

wrangler d1 create ideaboard # create database 

# apply database schema
wrangler d1 execute ideaboard --local --config ./wrangler.toml --file src/db/schema.sql

# run on port 8787
wrangler dev --config ./wrangler.toml --port=8787
```

### Run Frontend
```bash
npm install # (or preferred runtime)

# set local backend url
echo "NEXT_PUBLIC_WORKER_ORIGIN=http://127.0.0.1:8787" > .env.local

npm run dev:next
```

## Additional Information

### API Documentation
`GET /state` - fetch room notes and summary 

`POST /workflow/summarize?room={id}` - generate and persist AI summary

`WS /join?room={id}` - realtime socket for notes and votes.

### AI Models Used
**Summarization** - `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
**Embeddings** - `@cf/baai/bge-base-en-v1.5`

## License

This repository is licensed under the [MIT License](LICENSE).
