# MOVIEFLIX — Movie Streaming & Management Studio

MOVIEFLIX is a full-stack movie catalog and content management web application built with React, Vite, Tailwind CSS, Node.js, Express, MongoDB, Mongoose, and JWT authentication.

## Project Structure

```text
├── frontend/                  # React + Vite frontend application
│   └── src/
│       ├── components/        # Reusable UI components (Navbar, HeroSection, MovieCard, Modals)
│       ├── context/           # AuthContext (in-memory JWT) & ToastContext
│       ├── pages/             # HomePage, MovieDetailsPage, AdminAuthPage, AdminDashboardPage
│       ├── services/          # REST API client
│       └── types/             # TypeScript interfaces
├── backend/                   # Express REST API & MongoDB/Mongoose layer
│   ├── config/                # MongoDB connection manager (MONGODB_URI + dev fallback)
│   ├── middleware/            # JWT verification middleware
│   ├── models/                # Mongoose schemas (Movie, Category, Admin)
│   ├── routes/                # REST endpoints (/api/movies, /api/categories, /api/auth)
│   ├── seed/                  # Initial MongoDB catalog & category seeder
│   └── utils/                 # Input validation & URL safety helpers
├── src/                       # Vite root entry & generated image assets
├── server.ts                  # Unified Express + Vite server entry point (port 3000)
└── .env.example               # Environment variable template
```

## REST API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/movies` | Public | List movies with search, genre filter, sort, and pagination |
| `GET` | `/api/movies/:id` | Public | Get single movie details and related titles |
| `POST` | `/api/movies` | Admin (JWT) | Create a new movie |
| `PUT` | `/api/movies/:id` | Admin (JWT) | Update an existing movie |
| `DELETE` | `/api/movies/:id` | Admin (JWT) | Delete a movie |
| `GET` | `/api/categories` | Public | List movie categories and movie counts |
| `POST` | `/api/categories` | Admin (JWT) | Create a movie category |
| `DELETE` | `/api/categories/:id` | Admin (JWT) | Delete an unused category |
| `POST` | `/api/auth/register` | Public | Register an administrator account (bcrypt hashed) |
| `POST` | `/api/auth/login` | Public | Authenticate administrator and issue JWT |
| `GET` | `/api/auth/me` | Admin (JWT) | Verify active administrator session |

## Local Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and set your MongoDB connection string (local MongoDB or MongoDB Atlas):
   ```bash
   cp .env.example .env
   ```
   Example `.env`:
   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/movieflix
   PORT=3000
   ```
   *(If `MONGODB_URI` is left blank during local development, the backend automatically starts an embedded MongoDB instance via `mongodb-memory-server` so the app runs immediately.)*

3. **Run in development mode (Frontend + Backend on port 3000):**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000).

4. **Build and run in production:**
   ```bash
   npm run build
   npm start
   ```

## Administrator Workflow

1. Navigate to **Admin** (`/admin`) or click **Admin Sign In** in the top bar.
2. Register your administrator account on first launch (passwords are hashed with `bcryptjs` and sessions use `JWT`).
3. From the **Admin Studio**, add new movies, edit existing titles, toggle Hero/Trending placement, delete titles with confirmation, and manage catalog categories.
