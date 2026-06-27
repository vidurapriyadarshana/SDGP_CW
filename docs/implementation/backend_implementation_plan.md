# Backend Implementation Plan: Phase-by-Phase Development

This document outlines the step-by-step development phases to build the Node.js + Express + Mongoose backend engine for the Quiz Web App. The routing and business layers are partitioned into three boundaries: Authentication, Administration, and Student/User services.

---

## Phase 1: Database Setup & Mongoose Models
Implement Mongoose Schemas with TypeScript interfaces in `backend/src/models/`.

### 1. User Model (`backend/src/models/User.ts`)
```typescript
import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  passwordHash: string;
  role: 'Admin' | 'Student';
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Student'], required: true },
  createdAt: { type: Date, default: Date.now }
});

export default model<IUser>('User', UserSchema);
```

### 2. Category Model (`backend/src/models/Category.ts`)
```typescript
import { Schema, model, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  description: string;
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, unique: true, trim: true },
  description: { type: String, required: true }
});

export default model<ICategory>('Category', CategorySchema);
```

### 3. Quiz Model (`backend/src/models/Quiz.ts`)
```typescript
import { Schema, model, Document } from 'mongoose';

export interface IQuiz extends Document {
  categoryId: Schema.Types.ObjectId;
  creatorId: Schema.Types.ObjectId;
  title: string;
  description: string;
  timeLimit: number;
  createdAt: Date;
}

const QuizSchema = new Schema<IQuiz>({
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, trim: true },
  description: { type: String },
  timeLimit: { type: Number, required: true, default: 600 },
  createdAt: { type: Date, default: Date.now }
});

export default model<IQuiz>('Quiz', QuizSchema);
```

### 4. Question Model (`backend/src/models/Question.ts`)
Embedded Option subdocuments.
```typescript
import { Schema, model, Document } from 'mongoose';

export interface IOption {
  _id?: Schema.Types.ObjectId;
  optionText: string;
  isCorrect: boolean;
}

export interface IQuestion extends Document {
  quizId: Schema.Types.ObjectId;
  questionText: string;
  points: number;
  options: IOption[];
}

const OptionSchema = new Schema<IOption>({
  optionText: { type: String, required: true },
  isCorrect: { type: Boolean, required: true, default: false }
});

const QuestionSchema = new Schema<IQuestion>({
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  questionText: { type: String, required: true },
  points: { type: Number, required: true, default: 1 },
  options: [OptionSchema]
});

export default model<IQuestion>('Question', QuestionSchema);
```

### 5. Attempt Model (`backend/src/models/Attempt.ts`)
```typescript
import { Schema, model, Document } from 'mongoose';

export interface IAttemptAnswer {
  questionId: Schema.Types.ObjectId;
  selectedOptionId: Schema.Types.ObjectId | null;
  isCorrect: boolean;
}

export interface IAttempt extends Document {
  userId: Schema.Types.ObjectId;
  quizId: Schema.Types.ObjectId;
  score: number;
  totalPoints: number;
  timeTakenSeconds: number;
  startedAt: Date;
  submittedAt: Date;
  answers: IAttemptAnswer[];
}

const AttemptAnswerSchema = new Schema<IAttemptAnswer>({
  questionId: { type: Schema.Types.ObjectId, required: true },
  selectedOptionId: { type: Schema.Types.ObjectId, default: null },
  isCorrect: { type: Boolean, required: true }
});

const AttemptSchema = new Schema<IAttempt>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  quizId: { type: Schema.Types.ObjectId, ref: 'Quiz', required: true },
  score: { type: Number, required: true },
  totalPoints: { type: Number, required: true },
  timeTakenSeconds: { type: Number, required: true },
  startedAt: { type: Date, required: true },
  submittedAt: { type: Date, default: Date.now },
  answers: [AttemptAnswerSchema]
});

export default model<IAttempt>('Attempt', AttemptSchema);
```

---

## Phase 2: Authentication & Security (Auth Boundary)
Implement user sign-up, sign-in, JWT route guards, and map them to `/api/auth`.

### 1. Security Middleware (`backend/src/middleware/auth.middleware.ts`)
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: 'Admin' | 'Student';
  };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; role: 'Admin' | 'Student' };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired session token.' });
  }
};

export const roleGuard = (allowedRoles: ('Admin' | 'Student')[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
      return;
    }
    next();
  };
};
```

### 2. Auth Controllers (`backend/src/controllers/auth.controller.ts`)
```typescript
import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth.middleware';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ username, email, passwordHash, role });
    await user.save();
    res.status(201).json({ message: 'User registered successfully', userId: user._id });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '2h' });
    res.status(200).json({ message: 'Login successful', token, user: { id: user._id, username: user.username, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.userId).select('-passwordHash');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
```

### 3. Auth Routes (`backend/src/routes/auth.routes.ts`)
```typescript
import { Router } from 'express';
import { register, login, getProfile } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', authMiddleware, getProfile);

export default router;
```

---

## Phase 3: Administrative Services (Admin Boundary)
Implement Category CRUD, Quiz CRUD, and Question/Options creation, mapped to `/api/admin` and restricted strictly to `Admin` users.

### 1. Admin Controllers (`backend/src/controllers/admin.controller.ts`)
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Category from '../models/Category';
import Quiz from '../models/Quiz';
import Question from '../models/Question';

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description } = req.body;
    const category = new Category({ name, description });
    await category.save();
    res.status(201).json({ message: 'Category created successfully', categoryId: category._id });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { categoryId, title, description, timeLimit } = req.body;
    const quiz = new Quiz({ categoryId, creatorId: req.user?.userId, title, description, timeLimit });
    await quiz.save();
    res.status(201).json({ message: 'Quiz created successfully', quizId: quiz._id });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};

export const addQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { questionText, points, options } = req.body;
    const quizId = req.params.quizId;
    const question = new Question({ quizId, questionText, points, options });
    await question.save();
    res.status(201).json({ message: 'Question and options added successfully', questionId: question._id });
  } catch (error) {
    res.status(400).json({ error: (error as Error).message });
  }
};
```

### 2. Admin Routes (`backend/src/routes/admin.routes.ts`)
```typescript
import { Router } from 'express';
import { createCategory, createQuiz, addQuestion } from '../controllers/admin.controller';
import { authMiddleware, roleGuard } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(roleGuard(['Admin']));

router.post('/categories', createCategory);
router.post('/quizzes', createQuiz);
router.post('/quizzes/:quizId/questions', addQuestion);

export default router;
```

---

## Phase 4: Student/User Services (User Boundary)
Implement quiz loading, scoring, attempts logs, and leaderboards, mapped to `/api/student`.

### 1. Student Controllers (`backend/src/controllers/student.controller.ts`)
```typescript
import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import Category from '../models/Category';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import Attempt from '../models/Attempt';

export const getQuizzes = async (req: AuthRequest, res: Response) => {
  try {
    const quizzes = await Quiz.find().populate('categoryId', 'name');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const startQuizAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    // Exclude correctness data to prevent Inspect sniff cheating
    const questions = await Question.find({ quizId }).select('-options.isCorrect');
    res.status(200).json({ quizId, title: quiz.title, timeLimit: quiz.timeLimit, questions });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const submitQuizAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const quizId = req.params.quizId;
    const userId = req.user?.userId;
    const { answers, startedAt } = req.body;

    const questions = await Question.find({ quizId });
    let totalScore = 0;
    let maxPoints = 0;

    const gradingAnswers = questions.map(q => {
      const selection = answers.find((a: any) => a.questionId === q.id);
      const correctOpt = q.options.find(o => o.isCorrect === true);
      const isCorrect = selection && selection.selectedOptionId === correctOpt?._id?.toString();

      if (isCorrect) totalScore += q.points;
      maxPoints += q.points;

      return {
        questionId: q._id,
        selectedOptionId: selection ? selection.selectedOptionId : null,
        isCorrect: !!isCorrect
      };
    });

    const timeTaken = Math.round((Date.now() - new Date(startedAt).getTime()) / 1000);

    const attempt = new Attempt({
      userId,
      quizId,
      score: totalScore,
      totalPoints: maxPoints,
      timeTakenSeconds: timeTaken,
      startedAt,
      answers: gradingAnswers
    });

    await attempt.save();
    res.status(200).json({ message: 'Submission evaluated', attemptId: attempt._id, score: totalScore, totalPoints: maxPoints });
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getAttemptsHistory = async (req: AuthRequest, res: Response) => {
  try {
    const attempts = await Attempt.find({ userId: req.user?.userId }).populate('quizId', 'title');
    res.status(200).json(attempts);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response) => {
  try {
    const leaderboard = await Attempt.find({ quizId: req.params.quizId })
      .populate('userId', 'username')
      .sort({ score: -1, timeTakenSeconds: 1 })
      .limit(10);
    res.status(200).json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
};
```

### 2. Student Routes (`backend/src/routes/student.routes.ts`)
```typescript
import { Router } from 'express';
import { getQuizzes, startQuizAttempt, submitQuizAttempt, getAttemptsHistory, getLeaderboard } from '../controllers/student.controller';
import { authMiddleware, roleGuard } from '../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.use(roleGuard(['Student']));

router.get('/quizzes', getQuizzes);
router.get('/quizzes/:quizId/play', startQuizAttempt);
router.post('/quizzes/:quizId/submit', submitQuizAttempt);
router.get('/attempts/history', getAttemptsHistory);
router.get('/quizzes/:quizId/leaderboard', getLeaderboard);

export default router;
```

---

## Phase 5: Server Instantiation & Testing
Mount the boundary routers onto the app engine inside `backend/src/app.ts`.

### Updated App File Configuration (`backend/src/app.ts`)
```typescript
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import studentRoutes from './routes/student.routes';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// DB link connection
connectDB();

app.use(cors());
app.use(express.json());

// Routes Mounts
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/student', studentRoutes);

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Quiz API is active and listening.' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

export default app;
```
