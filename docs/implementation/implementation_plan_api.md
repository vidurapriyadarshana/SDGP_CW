# Quiz Web App MVP: 2-Day Implementation Plan & API Specification

This document details the step-by-step implementation schedule for a 2-day MVP development process, along with a comprehensive API endpoint specification.

---

## 1. 2-Day Implementation Schedule

```
               DAY 1: BACKEND, DB & ADMIN APIs (8 Hours)
┌──────────────────┬─────────────────┬───────────────────┬───────────────────┐
│ DB Setup         │ Express Boiler  │ Auth APIs         │ Admin CRUD APIs   │
│ Task 1 (1-2 hr)  │ Task 2 (1 hr)   │ Task 3 (2 hr)     │ Task 4 (3 hr)     │
└──────────────────┴─────────────────┴───────────────────┴───────────────────┘

               DAY 2: FRONTEND UI, GAME LOGIC & SCORING (8 Hours)
┌──────────────────┬─────────────────┬───────────────────┬───────────────────┐
│ Frontend UI      │ Quiz Engine     │ Backend Scoring   │ Testing & QA      │
│ Task 5 (3 hr)    │ Task 6 (2 hr)   │ Task 7 (1 hr)     │ Task 8 (2 hr)     │
└──────────────────┴─────────────────┴───────────────────┴───────────────────┘
```

### Day 1: Backend Architecture & Creator Features
*   **Task 1: Database Setup & Migration (Hours 0.0 - 2.0)**
    *   Initialize MySQL/PostgreSQL instances.
    *   Execute DDL scripts to create: `Users`, `Categories`, `Quizzes`, `Questions`, `Options`, `Attempts`, and `AttemptAnswers`.
    *   Verify table relationships and constraints.
*   **Task 2: Backend Core Project Setup (Hours 2.0 - 3.0)**
    *   Initialize Node.js project: `npm init -y`.
    *   Install core dependencies: `npm install express mysql2 cors bcrypt jsonwebtoken dotenv`.
    *   Setup the MVC folder structure and boilerplate error handling.
*   **Task 3: Authentication and Guard Services (Hours 3.0 - 5.0)**
    *   Implement user registration (with `bcrypt` password hashing) and login routes.
    *   Develop a JWT signing route and a middleware authentication handler (`authMiddleware`) to verify bearer tokens and decode roles (`Admin` or `Student`).
*   **Task 4: Admin Content API Management (Hours 5.0 - 8.0)**
    *   Build CRUD endpoints for Quiz Categories, Quizzes, Questions, and Option elements.
    *   Apply the `authMiddleware` to secure all administrative actions, ensuring only users with the `Admin` role can POST, PUT, or DELETE content.

### Day 2: Client Interface & Secure Scoring Mechanics
*   **Task 5: Frontend Responsive Screens (Hours 0.0 - 3.0)**
    *   Setup the client project directory structure.
    *   Implement markup and styling for core user flows:
        *   *Auth:* Register & Login cards.
        *   *Dashboard:* Browse quizzes categorised with descriptive cards.
        *   *Quiz Arena:* Simple question card, navigation controls, and clear visual countdown clock.
        *   *Performance Review:* Score indicator and global leaderboard.
*   **Task 6: Timed Game Engine Flow (Hours 3.0 - 5.0)**
    *   Implement API requests loading quiz datasets. Correct options must **never** be sent to the client to prevent inspector cheating.
    *   Build client state management to handle currently selected options, timers, and submission triggers.
*   **Task 7: Secure Backend Scoring Logic (Hours 5.0 - 6.0)**
    *   Develop the submission route `POST /api/quizzes/:id/submit`.
    *   The backend retrieves correct option mappings from the database, compares user submissions, tallies scores, updates database state, and responds with score and feedback metadata.
*   **Task 8: End-to-End QA Testing & Packaging (Hours 6.0 - 8.0)**
    *   Perform comprehensive integration testing:
        *   Attempting to modify database structures as a student (ensure 403 Forbidden).
        *   Attempting a quiz and checking if timeouts force submit.
        *   Verification of auto-calculated scores against manual evaluations.
        *   Verify that history log lists attempts correctly.

---

## 2. API Endpoint Specifications

All protected routes require an HTTP Authorization header: `Authorization: Bearer <JWT_TOKEN>`

### A. Authentication API

#### 1. Register User
*   **Method & Path:** `POST /api/auth/register`
*   **Description:** Creates a new user in the system.
*   **Payload (Request):**
    ```json
    {
      "username": "student_johndoe",
      "email": "john.doe@example.com",
      "password": "SecurePassword123",
      "role": "Student"
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "message": "User registered successfully",
      "userId": 14
    }
    ```
*   **Error Response (400 Bad Request):**
    ```json
    {
      "error": "Email address already registered"
    }
    ```

#### 2. Login User
*   **Method & Path:** `POST /api/auth/login`
*   **Description:** Validates credentials and returns a session JWT.
*   **Payload (Request):**
    ```json
    {
      "email": "john.doe@example.com",
      "password": "SecurePassword123"
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "message": "Login successful",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 14,
        "username": "student_johndoe",
        "role": "Student"
      }
    }
    ```
*   **Error Response (401 Unauthorized):**
    ```json
    {
      "error": "Invalid email or password"
    }
    ```

#### 3. Get User Profile
*   **Method & Path:** `GET /api/auth/profile`
*   **Authentication:** Required (Bearer Token)
*   **Description:** Retrieves profile information for the authenticated user.
*   **Payload (Request):** None
*   **Success Response (200 OK):**
    ```json
    {
      "id": 14,
      "username": "student_johndoe",
      "email": "john.doe@example.com",
      "role": "Student",
      "registeredAt": "2026-06-27T06:30:00Z"
    }
    ```

---

### B. Category & Quiz Management APIs (Admin Required)

#### 4. Create Category
*   **Method & Path:** `POST /api/categories`
*   **Authentication:** Required (Admin Only)
*   **Description:** Adds a new quiz classification category.
*   **Payload (Request):**
    ```json
    {
      "name": "Software Engineering",
      "description": "Quizzes covering design patterns, agile development, and SDLC models."
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "message": "Category created successfully",
      "categoryId": 5
    }
    ```

#### 5. Get All Categories
*   **Method & Path:** `GET /api/categories`
*   **Description:** Fetches all category tags for filtering quizzes.
*   **Payload (Request):** None
*   **Success Response (200 OK):**
    ```json
    [
      {
        "id": 1,
        "name": "Web Development",
        "description": "HTML, CSS, JS and frontend technologies"
      },
      {
        "id": 5,
        "name": "Software Engineering",
        "description": "Quizzes covering design patterns, agile development, and SDLC models."
      }
    ]
    ```

#### 6. Create Quiz
*   **Method & Path:** `POST /api/quizzes`
*   **Authentication:** Required (Admin Only)
*   **Description:** Instantiates a new quiz.
*   **Payload (Request):**
    ```json
    {
      "categoryId": 5,
      "title": "Design Patterns Trivia",
      "description": "Test your knowledge on Creational, Structural, and Behavioral patterns.",
      "timeLimit": 600
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "message": "Quiz created successfully",
      "quizId": 42
    }
    ```

#### 7. Get All Quizzes
*   **Method & Path:** `GET /api/quizzes`
*   **Description:** List metadata of all quizzes.
*   **Payload (Request):** None
*   **Success Response (200 OK):**
    ```json
    [
      {
        "id": 42,
        "categoryId": 5,
        "categoryName": "Software Engineering",
        "title": "Design Patterns Trivia",
        "description": "Test your knowledge on Creational, Structural, and Behavioral patterns.",
        "timeLimit": 600,
        "questionCount": 0
      }
    ]
    ```

#### 8. Add Question to Quiz
*   **Method & Path:** `POST /api/quizzes/:id/questions`
*   **Authentication:** Required (Admin Only)
*   **Description:** Appends a question with its multiple-choice options to a quiz.
*   **Payload (Request):**
    ```json
    {
      "questionText": "Which design pattern is used to instantiate a class while hiding creation logic?",
      "points": 5,
      "options": [
        { "optionText": "Singleton Pattern", "isCorrect": false },
        { "optionText": "Factory Pattern", "isCorrect": true },
        { "optionText": "Observer Pattern", "isCorrect": false },
        { "optionText": "Adapter Pattern", "isCorrect": false }
      ]
    }
    ```
*   **Success Response (201 Created):**
    ```json
    {
      "message": "Question and options added successfully",
      "questionId": 105
    }
    ```

---

### C. Student Gameplay & Scoring APIs

#### 9. Fetch Quiz Questions (For Play)
*   **Method & Path:** `GET /api/quizzes/:id/play`
*   **Authentication:** Required (Student Only)
*   **Description:** Retrieves quiz details and questions for active testing. Correct answer options are stripped from response.
*   **Payload (Request):** None
*   **Success Response (200 OK):**
    ```json
    {
      "quizId": 42,
      "title": "Design Patterns Trivia",
      "timeLimit": 600,
      "questions": [
        {
          "id": 105,
          "questionText": "Which design pattern is used to instantiate a class while hiding creation logic?",
          "points": 5,
          "options": [
            { "id": 401, "optionText": "Singleton Pattern" },
            { "id": 402, "optionText": "Factory Pattern" },
            { "id": 403, "optionText": "Observer Pattern" },
            { "id": 404, "optionText": "Adapter Pattern" }
          ]
        }
      ]
    }
    ```

#### 10. Submit Quiz Answers
*   **Method & Path:** `POST /api/quizzes/:id/submit`
*   **Authentication:** Required (Student Only)
*   **Description:** Receives student's selected choices, calculates scores securely on the backend, saves results, and returns grading results.
*   **Payload (Request):**
    ```json
    {
      "answers": [
        { "questionId": 105, "selectedOptionId": 402 }
      ]
    }
    ```
*   **Success Response (200 OK):**
    ```json
    {
      "message": "Quiz grading complete",
      "attemptId": 302,
      "results": {
        "score": 5,
        "totalPoints": 5,
        "percentage": 100.0,
        "answersBreakdown": [
          {
            "questionId": 105,
            "selectedOptionId": 402,
            "correctOptionId": 402,
            "isCorrect": true
          }
        ]
      }
    }
    ```

#### 11. Get Attempt History
*   **Method & Path:** `GET /api/attempts/user`
*   **Authentication:** Required (Student Only)
*   **Description:** Returns all quiz attempt logs for the authenticated student.
*   **Payload (Request):** None
*   **Success Response (200 OK):**
    ```json
    [
      {
        "attemptId": 302,
        "quizId": 42,
        "quizTitle": "Design Patterns Trivia",
        "score": 5,
        "totalPoints": 5,
        "startedAt": "2026-06-27T06:50:00Z",
        "submittedAt": "2026-06-27T06:55:00Z"
      }
    ]
    ```

#### 12. Get Quiz Leaderboard
*   **Method & Path:** `GET /api/quizzes/:id/leaderboard`
*   **Description:** Retrieves top performance records for a quiz.
*   **Payload (Request):** None
*   **Success Response (200 OK):**
    ```json
    [
      {
        "rank": 1,
        "username": "student_johndoe",
        "score": 5,
        "totalPoints": 5,
        "timeTakenSeconds": 300,
        "dateAttempted": "2026-06-27T06:55:00Z"
      }
    ]
    ```
