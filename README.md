# Voting App Backend

This is the backend service for the Voting App, built with **Node.js, Express, MongoDB, and JWT authentication**.  
It provides APIs for user authentication, voting, and user management for admin.

---

## Features
- User registration & login with JWT
- Role-based access (user/admin)
- Users can vote for existing names or add a new one and view current voting results
- Admin can:
  - Manage users (view, delete, edit role)
  - View total votes and results
- Backend tested with Jest & Supertest (TDD approach)

---

## Tech Stack
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (JSON Web Token)
- Jest & Supertest (for testing)

---

## Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/voting-app-backend.git
cd voting-app-backend
```

### 2. Instal dependencies
```bash
npm install
```

### 3. Create .env file
MONGO_URI=mongodb://127.0.0.1:27017/voting_app
JWT_SECRET=your_secret_key
PORT=5000

### 4. Start MongoDB
Make sure MongoDB is running locally
```bash
mongod
```

### 5. Run the server
```bash
npm start
```

### 6. Run tests
```bash
npm test
```
---

## API Endpoints
### Auth
- POST /auth/register => Register New user
- POST /auth/login => Login & receive JWT

### User
- POST /vote => Vote for a name (existing or new)
- GET /vote/results => View results

### Admin
- GET /admin/users/ => Get All users
- PUT /admin/users/:id => Update user role
- DELETE /admin/users/:id => Delete User
- GET /admin/summary => View total votes & results

---