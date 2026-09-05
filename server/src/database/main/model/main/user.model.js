import { mongoose } from '../../../index.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      match: /^[a-zA-Z\s.'/-]{2,50}$/,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    },
    password: {
      type: String,
      required: true,
      match: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    },
    phone: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      min: [18, 'age must be grater that 18 got {VALUE}'],
      max: [60, 'age must be less that 60 got {VALUE}'],
    },
  },
  {
    validateBeforeSave: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: true,
    toObject: true,
  }
);

export const UserModel = mongoose.models?.user || mongoose.model('user', userSchema);
