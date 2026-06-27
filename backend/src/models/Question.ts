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
