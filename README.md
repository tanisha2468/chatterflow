# ChatterFlow

Full-stack chat application with modular backend architecture and OTP-based authentication.

## Tech Stack

Frontend:

- Next.js (App Router)
- TypeScript
- Tailwind CSS

Backend:

- Node.js
- Express.js
- TypeScript
- MongoDB
- JWT Authentication
- RabbitMQ (for mail service)
- Cloudinary (for media handling)

## Architecture

The backend is structured modularly into:

- User Service (authentication, JWT, user management)
- Mail Service (OTP handling via message queue)
- Chat Service (chat and message handling)

This separation improves scalability and maintainability.

## Features Implemented

- User registration
- Login with JWT
- Email OTP verification
- Protected routes
- Modular backend structure

## In Progress

- Real-time messaging using Socket.io
- UI enhancements

## How to Run

1. Install dependencies inside backend and frontend folders.
2. Add environment variables in .env files.
3. Start backend services.
4. Start frontend with `npm run dev`.
