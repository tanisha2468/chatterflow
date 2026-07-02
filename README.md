# ChatterFlow

A real-time chat application built as a microservices system, with a Next.js frontend and three independent Node.js/TypeScript backend services.

## Architecture

```
Frontend (Next.js, React)
       │
       ▼
User Service (Node.js) ── Login, OTP, user management
       │
       ▼
   Redis (OTP storage)
       │
       ▼
  RabbitMQ (email queue)
       │
       ▼
Mail Service (Node.js) ── Sends OTP emails

Chat Service (Node.js) ── Chats, messages, Socket.IO
       │
       ▼
   MongoDB
```

- **User service** — auth, OTP generation, JWT issuance. Stores OTPs in Redis and publishes email jobs to RabbitMQ.
- **Mail service** — consumes the RabbitMQ queue and sends OTP emails via Nodemailer.
- **Chat service** — chats, messages, media uploads (Cloudinary), and real-time delivery via Socket.IO. Backed by MongoDB.
- **Frontend** — Next.js app that talks to the user and chat services over HTTP/WebSocket.

## Tech stack

- **Frontend:** Next.js, React, TypeScript, Tailwind
- **Backend:** Node.js, Express, TypeScript
- **Data/infra:** MongoDB, Redis, RabbitMQ, Cloudinary
- **Realtime:** Socket.IO
- **Auth:** JWT + OTP-based login

## Project structure

```
chatterflow/
├── backend/
│   ├── user/     # auth, OTP, user management
│   ├── mail/     # OTP email consumer
│   └── chat/     # chats, messages, sockets
├── frontend/     # Next.js app
└── reference/    # architecture notes and flow diagrams
```

## Running locally

Each service needs Node.js 18+, plus running instances of MongoDB, Redis, and RabbitMQ (local, Docker, or hosted).

For each backend service (`backend/user`, `backend/mail`, `backend/chat`):

```bash
cd backend/<service>
cp .env.example .env   # fill in real values
npm install
npm run dev
```

Default ports (set via each service's `.env`):
| Service | Suggested port |
|---|---|
| user | 5050 |
| chat | 5003 |
| mail | 5001 |

Frontend:

```bash
cd frontend
cp .env.example .env.local   # point at your running services
npm install
npm run dev
```

## Environment variables

**backend/user/.env**
```
REDIS_URL=
PORT=
MONGO_URI=
RABBITMQ_HOST=
RABBITMQ_USERNAME=
RABBITMQ_PASSWORD=
RABBITMQ_VHOST=
JWT_SECRET=
```

**backend/mail/.env**
```
PORT=
RABBITMQ_HOST=
RABBITMQ_USERNAME=
RABBITMQ_PASSWORD=
RABBITMQ_VHOST=
EMAIL_USER=
EMAIL_PASS=
```

**backend/chat/.env**
```
PORT=
MONGO_URI=
JWT_SECRET=
USER_SERVICE=
CLOUD_NAME=
CLOUD_API_KEY=
CLOUD_API_SECRET=
```

**frontend/.env.local**
```
NEXT_PUBLIC_USER_SERVICE=
NEXT_PUBLIC_CHAT_SERVICE=
```

## Deployment

Each backend service is independent and can be deployed separately (e.g. Render, Railway, Fly.io) — set its env vars on the host and point `npm run build && npm start` at it. The frontend deploys as a standard Next.js app (e.g. Vercel), with `NEXT_PUBLIC_USER_SERVICE` / `NEXT_PUBLIC_CHAT_SERVICE` pointing at the deployed backend URLs.

You'll need hosted instances of MongoDB (e.g. Atlas), Redis (e.g. Upstash), and RabbitMQ (e.g. CloudAMQP) — none of these run themselves.

## License

MIT
