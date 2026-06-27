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
