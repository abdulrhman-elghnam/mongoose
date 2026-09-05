import { mongoose } from '#/database/index.js';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,

      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user',
    },
  },
  {
    validateBeforeSave: true,
    strictQuery: true,
    optimisticConcurrency: true,
    toJSON: true,
    toObject: true,
    timestamps: true,
  }
);

export const NoteModel = mongoose.models?.note || mongoose.model('note', noteSchema);
