# OCC Admission API Client Information

## Laravel Passport OAuth Clients

### Password Grant Client
- **Client ID**: `01989bda-749b-70bd-b007-1c04d7087297`
- **Client Secret**: `NCRJNkXSTs7UKSGUIgXml0xB1Lr8AAJE3HVlqnpu`
- **Grant Type**: Password Grant
- **Purpose**: Used for mobile app authentication

### Personal Access Client
- **Client ID**: Generated automatically
- **Client Secret**: Generated automatically  
- **Grant Type**: Personal Access
- **Purpose**: Used for personal access tokens

## API Authentication Flow

### 1. Login (Get Access Token)
```bash
POST /api/login
Content-Type: application/json

{
    "email": "student@example.com",
    "password": "password"
}
```

**Response:**
```json
{
    "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
    "token_type": "Bearer",
    "user": {
        "id": 1,
        "name": "John Doe",
        "email": "student@example.com",
        "role": "student"
    },
    "examinee": {
        // examinee profile data
    }
}
```

### 2. Use Access Token
Include the token in the Authorization header for protected routes:
```bash
GET /api/user
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

### 3. Logout (Revoke Token)
```bash
POST /api/logout
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...
```

## Available API Endpoints

### Public Routes:
- `POST /api/login` - Authenticate and get access token
- `GET /api/test` - Test endpoint to verify API is working
- `GET /api/registration-status` - Check if registration is open

### Protected Routes (require authentication):
- `GET /api/user` - Get current user profile
- `POST /api/logout` - Logout and revoke token
- `GET /api/student/profile` - Get student profile
- `GET /api/student/exams` - Get available exams
- `GET /api/student/results` - Get exam results
- `POST /api/student/submit-exam` - Submit exam answers

## Important Notes

- Only users with role 'student' can authenticate via API
- Access tokens expire based on Passport configuration
- Tokens are automatically revoked on logout
- The system uses Bearer token authentication
- All API responses are in JSON format

## Testing Commands

1. **Test public endpoint:**
   ```bash
   curl http://localhost:8000/api/test
   ```

2. **Test login:**
   ```bash
   curl -X POST http://localhost:8000/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"student@example.com","password":"password"}'
   ```

3. **Test protected endpoint:**
   ```bash
   curl http://localhost:8000/api/user \
     -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
   ```
