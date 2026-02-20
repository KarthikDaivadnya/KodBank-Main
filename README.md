# KodBank - Banking Application

A full-stack banking application built with React, Node.js, Express, and MySQL. Features user registration, JWT authentication, and balance checking with beautiful animations.

![KodBank](https://img.shields.io/badge/KodBank-v1.0.0-blue)
![React](https://img.shields.io/badge/React-19.x-61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6)

## ✨ Features

- **User Registration** - Register with UID, username, email, phone, and password
- **Initial Balance** - Get ₹100,000 welcome bonus on registration
- **Secure Login** - JWT-based authentication with HTTP-only cookies
- **Dashboard** - View account information and check balance
- **Beautiful UI** - Modern design with confetti animations
- **Responsive** - Works on desktop and mobile devices

## 🚀 Quick Deploy to Vercel

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [MySQL Database](https://www.mysql.com/) (Aiven, Cloud SQL, or local)
- [GitHub Account](https://github.com/)

### Option 1: Deploy to Vercel (Recommended)

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/KarthikDaivadnya/KodBank-Main.git
   git push -u origin main
   ```

2. **Deploy Backend to Vercel:**
   - Go to [Vercel](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `/` (not `/client`)
   - Add environment variables:
     ```
     AIVEN_DB_URL=your_database_url
     DB_USERNAME=your_username
     DB_PASSWORD=your_password
     DB_HOST=your_host
     DB_PORT=your_port
     DB_NAME=your_database
     JWT_SECRET=your_secret_key
     JWT_EXPIRES_IN=24h
     PORT=5000
     NODE_ENV=production
     CLIENT_URL=https://your-frontend.vercel.app
     ```
   - Deploy

3. **Deploy Frontend to Vercel:**
   - Create a new project in Vercel
   - Import the same repository
   - Set root directory to `client`
   - Add environment variable:
     ```
     REACT_APP_API_URL=https://your-backend.vercel.app/api
     ```
   - Deploy

### Option 2: Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/KarthikDaivadnya/KodBank-Main.git
   cd KodBank
   ```

2. **Setup Backend:**
   ```bash
   # Install dependencies
   npm install
   
   # Configure environment variables
   cp .env.example .env
   # Edit .env with your database credentials
   
   # Start backend server
   npm start
   ```

3. **Setup Frontend:**
   ```bash
   cd client
   npm install
   npm start
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
KodBank/
├── server.js              # Express backend server
├── package.json          # Backend dependencies
├── .env                  # Environment variables
├── .gitignore           # Git ignore rules
├── README.md            # This file
└── client/              # React frontend
    ├── package.json     # Frontend dependencies
    ├── src/
    │   ├── pages/       # React pages (Login, Register, Dashboard)
    │   ├── components/  # Reusable components
    │   ├── contexts/    # React contexts (Auth)
    │   └── services/    # API services
    └── public/          # Static files
```

## 🔧 Environment Variables

### Backend (.env)
```env
# Database Configuration
AIVEN_DB_URL=mysql://user:password@host:port/database?ssl-mode=REQUIRED
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_HOST=your_db_host
DB_PORT=your_db_port
DB_NAME=your_database_name

# JWT Configuration
JWT_SECRET=your_super_secret_key
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

### Frontend
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🔐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login and get JWT token |
| GET | `/api/balance` | Get user balance (protected) |
| POST | `/api/logout` | Logout and invalidate token |
| GET | `/api/verify` | Verify JWT token (protected) |
| GET | `/api/health` | Health check |

## 🛠️ Tech Stack

### Backend
- Node.js
- Express.js
- MySQL (mysql2)
- JWT (jsonwebtoken)
- Bcrypt (bcryptjs)
- Cookie Parser
- Helmet (security)

### Frontend
- React 19
- TypeScript
- Tailwind CSS
- Framer Motion
- Canvas Confetti
- React Router
- Axios

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Karthik Daivadnya**
- GitHub: [@KarthikDaivadnya](https://github.com/KarthikDaivadnya)

## 🙏 Acknowledgments

- Thanks to all contributors
- Built with love for learning purposes
