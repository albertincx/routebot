# RouteCab Bot 🚗

> A modern Telegram Bot and REST API backend for connecting drivers and passengers with matching regular/daily routes, powering [route.cab](https://route.cab).

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2018.0.0-blue.svg)](https://nodejs.org)
[![Telegram Bot](https://img.shields.io/badge/Telegram-Bot-blue.svg?logo=telegram)](https://t.me/RouteCabBot)

---

## 🌟 Key Features

- **Telegram Bot Integration**: Powered by [Telegraf](https://github.com/telegraf/telegraf), allows users to register as one of three roles:
  - 🚘 **Driver**: Regular drivers who are willing to take passengers.
  - 👥 **Sharing Driver**: Drivers looking to share the driving load.
  - 🚶‍♂️ **Passenger**: Commuters looking for rides along similar routes.
- **Route Matching Engine**: Find and suggest users with similar spatial routes nearby.
- **Telegram Mini App (TMA)**: Seamless support for Telegram Mini Apps with secure WebApp initialization data validation.
- **Secure REST API**: Fully functional endpoints for frontend applications with JSON Web Token (JWT) authorization and Google Single Sign-On (SSO).
- **Multilingual Messaging**: Dynamic response generation in **English (EN)**, **Russian (RU)**, and **German (DE)**.
- **Scheduled Background Tasks**: Flexible cron system for periodic database validation and matching alerts.
- **Developer & Admin Commands**: Special bot controls for admins, including `/stat`, `/statl` (language statistics), app hot-reloading (`/restartApp`), configuration toggling, and remote git pulling (`/gitPull`).

---

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express (with CORS and body-parsing middleware)
- **Telegram SDK**: Telegraf v4
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT & Google OAuth 2.0
- **Task Scheduling**: Cron
- **Code Quality**: ESLint (Airbnb configuration) & Ava (Testing)

---

## 📂 Project Structure

```text
├── docs/               # Technical API documentation
│   └── api.md          # REST API references
├── src/
│   ├── api/            # Telegram Bot core controller
│   │   ├── routes/
│   │   │   ├── bot.js  # Main command handlers (/start, /help, /stat)
│   │   │   ├── route.js# Spatial route matching and actions
│   │   │   └── view/   # Formatting messages for bot views
│   │   └── utils/      # Bot helper utilities (db helpers, admin checks)
│   ├── config/         # System configurations (variables, database, keyboards)
│   ├── keyboards/      # Keyboard layouts for Telegram chat interface
│   ├── lib/            # Shared libraries (Google/TMA authentication, helper functions)
│   ├── messages/       # Localization files (EN, RU, DE)
│   ├── models/         # Mongoose schemas (User, Route, etc.)
│   ├── routes/         # Express REST API controllers
│   ├── service/        # Background queue (RabbitMQ client) and Cron jobs
│   ├── app.js          # Express app configurations
│   └── index.js        # Main entry point (starts server and bot instance)
├── package.json        # Node.js dependencies and script aliases
└── readme.md           # This file
```

---

## 🚀 Getting Started

### 📋 Prerequisites

Make sure you have the following installed:
- [Node.js](https://nodejs.org/) (v18.0.0 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (running instance)
- A Telegram Bot token (obtained from [@BotFather](https://t.me/BotFather))

### 🔧 Installation & Configuration

1. **Clone the Repository**:
   ```bash
   git clone git@github.com:albertincx/routecab.git
   cd routecab
   ```

2. **Install Dependencies**:
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Configure Environment Variables**:
   Copy `.env.example` to `.env` and fill in the required variables:
   ```bash
   cp .env.example .env
   ```

   **Core Environment Variables**:
   | Variable | Description | Example |
   | :--- | :--- | :--- |
   | `PORT` | Port for the Express server to listen on | `3000` |
   | `TBTKN` | Telegram Bot API Token | `123456789:ABCdefGhIJKlmNoPQRsTUVwxyZ` |
   | `MONGO_URI` | MongoDB Connection String | `mongodb://localhost:27017/routecab` |
   | `TGADMIN` | Telegram User ID of the primary admin | `987654321` |
   | `TMA_URL` | URL endpoint for the Telegram Mini App | `https://web.route.cab` |
   | `JWT_SECRET` | Secret key for signing JWT tokens | `your_jwt_secret_phrase` |
   | `GOOGLE_CLIENT_ID`| Google Client ID for Google Sign-In | `your-google-client-id.apps.googleusercontent.com` |

---

## 💻 Running the App

- **Development Mode** (with automatic hot-reloads via nodemon):
  ```bash
  yarn dev
  ```

- **Production Mode**:
  ```bash
  yarn start
  ```

---

## 📡 API Reference

The backend exposes a comprehensive REST API for interacting with the service (e.g. managing users, routes, locations, and distance filters). 

Please check [docs/api.md](docs/api.md) for full descriptions of parameters, responses, and status codes.

---

## 📝 License

Distributed under the GNU General Public License v3. See [LICENSE](LICENSE) for details.
