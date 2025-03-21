
# Backend for Education Platform

This folder contains backend code for the Education Platform application.

## How to Run the Backend

Since we can't directly modify `package.json` to add the backend dependencies, you'll need to set up and run the backend separately:

1. Create a new directory for the backend outside this project
2. Initialize a new Node.js project: `npm init -y`
3. Install required dependencies:
   ```
   npm install express cors body-parser mysql2 bcryptjs jsonwebtoken
   ```
4. Copy the `server.js` file from this folder to your backend directory
5. Run the server: `node server.js`

The backend will run on port 5000 by default.

## API Endpoints

### Authentication
- POST `/api/register` - Register a new user
- POST `/api/login` - Login user

### Courses
- GET `/api/courses` - Get all courses
- GET `/api/courses/:id` - Get a specific course with its lessons and quizzes

### User
- GET `/api/user` - Get current user information (protected route)

## Database Setup

Ensure you have a MySQL database named `quizcoursehub` with the following tables:
- users
- courses
- lessons
- quizzes
- questions
- answers
- courseenrollments
- blogposts
- comments
- resources
- purchasehistory
- transactions

The database structure should match the SQL schema provided in the project requirements.
