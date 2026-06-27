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
