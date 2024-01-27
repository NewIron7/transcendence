# 🎮 Ft_Transcendence: Pong Challenge

## Project Overview
![Project Image](images/game.png)
**Ft_Transcendence** is a web platform for Pong enthusiasts. It features a multiplayer Pong game, user authentication, chat functionality, and real-time gameplay.

## 🛠️ Tech Stack
- **Frontend**: Next.js (TypeScript)
- **Backend**: NestJS with Prisma
- **UI**: Shadcn
- **Database**: PostgreSQL
- **Containerization**: Docker

## Features
- **Multiplayer Pong Game**: Real-time online gameplay faithful to the classic Pong.
- **User Authentication**: OAuth system integration for secure login.
- **Chat System**: Public and private chat rooms with direct messaging capabilities.
- **Profile Customization**: Users can set avatars and enable two-factor authentication.
- **Matchmaking System**: Queue and automatic player matching for games.
- **Responsive Design**: Compatible with the latest versions of Google Chrome and other major browsers.
- **Security**: Protection against SQL injections, hashed passwords, and server-side validation.

## Testing the Project
### Configuration
- **OAuth Setup**: Add `CLIENT_ID` and `CLIENT_SECRET` from the 42 API to the `.env` file in the backend.
- **IP Configuration**: Use `setEnv` script to configure the IP address.

### Setup Script
- A shell script is provided to set up a simple environment.
- The script installs git, docker, creates a user with a default password (to be changed), and generates an SSH key.

### Running the Project
- **Makefile**: Use the Makefile to build, run, stop, and delete containers.
- Commands include `make build`, `make run`, `make stop`, and `make down`.

