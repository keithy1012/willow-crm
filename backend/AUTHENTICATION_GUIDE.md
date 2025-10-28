# Authentication System Guide

This document explains how to use the authentication and authorization system in the Willow CRM application.

## Features

✅ **Password Hashing** - Passwords are hashed using bcrypt with salt rounds of 10
✅ **JWT Token Generation** - Secure JWT tokens for authentication
✅ **Token Verification** - Middleware to verify and decode JWT tokens
✅ **Password Security** - Passwords are excluded from database queries by default
✅ **Role-based Authorization** - Access control based on user roles

## Environment Variables

Add these to your `.env` file:

```env
JWT_SECRET=your_strong_secret_key_here
JWT_EXPIRE=7d
```

## API Endpoints

### 1. Register a New User

**POST** `/api/users/register`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "securepassword123",
  "role": "Patient",
  "gender": "Male",
  "phoneNumber": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "userID": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "Patient"
  }
}
```

### 2. Login

**POST** `/api/users/login`

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "Patient"
  }
}
```

### 3. Get Current User (Protected)

**GET** `/api/users/me`

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "_id": "...",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "Patient"
  }
}
```

## Using Authentication Middleware

### Protect a Route (Require Authentication)

```javascript
import { authenticate } from "../middleware/authentication.js";

router.get("/protected-route", authenticate, yourController);
```

### Require Specific Roles

```javascript
import { authenticate } from "../middleware/authentication.js";
import { requireRole } from "../middleware/authMiddleware.js";

// Allow only Doctor or Patient roles
router.post("/api/appointments", authenticate, requireRole(["Doctor", "Patient"]), createAppointment);

// Allow only Ops or IT roles
router.get("/api/admin", authenticate, requireRole(["Ops", "IT"]), getAdminData);
```

### Combine Both Middlewares

```javascript
// This route requires:
// 1. User to be authenticated
// 2. User to have "Ops" role
router.delete("/api/tickets/:id", authenticate, requireRole(["Ops"]), deleteTicket);
```

## User Roles

The system supports the following roles:
- **Doctor** - Healthcare providers
- **Patient** - Patients receiving care
- **Ops** - Operations team members
- **IT** - IT support staff

## Security Features

1. **Password Hashing**: Passwords are automatically hashed using bcrypt before saving
2. **Password Exclusion**: Passwords are excluded from queries by default (using `select: false`)
3. **JWT Tokens**: Secure token-based authentication
4. **Token Expiration**: Tokens expire after 7 days (configurable via `JWT_EXPIRE`)
5. **No Password in Response**: The `toJSON` method ensures passwords are never sent in API responses

## Error Handling

### Authentication Errors
- `401 Unauthorized` - No token provided or token is invalid
- `401 Token Expired` - JWT token has expired
- `500 Authentication failed` - Server error during authentication

### Authorization Errors
- `401 Not authenticated` - User not authenticated
- `403 Forbidden: insufficient permissions` - User doesn't have required role

### Registration/Login Errors
- `400 Missing required fields` - Required fields not provided
- `400 Invalid role` - Role not in allowed list
- `401 Invalid credentials` - Wrong email or password
- `409 User already exists` - Email already registered

## Example Frontend Usage

```javascript
// Register
const response = await fetch('/api/users/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'Patient'
  })
});

const { token, user } = await response.json();
localStorage.setItem('token', token);

// Login
const loginResponse = await fetch('/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'john@example.com',
    password: 'password123'
  })
});

const { token: authToken } = await loginResponse.json();
localStorage.setItem('token', authToken);

// Make authenticated request
const protectedResponse = await fetch('/api/users/me', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
});
```

