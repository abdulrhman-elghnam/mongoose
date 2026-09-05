import { NoteModel, UserModel } from '#/database/index.js';
import createError from 'http-errors';

export const createNote = async (id, { title, content }) => {
  try {
    const user = await UserModel.findById(id);
    if (!user) {
      throw createError(404, 'user not found');
    }
    if (user) {
      const result = await NoteModel.create({ title, content, userId: id });
      return { message: 'note created successfully', status: 200, data: result };
    } else {
      throw createError(409, 'account created before');
    }
  } catch (error) {
    throw createError(409, error);
  }
};

export const updateNote = async (id, userId, { title, content }) => {
  try {
    const note = await NoteModel.findById(id);
    if (!note) {
      throw createError(404, 'note not found');
    }
    if (note.userId !== userId) {
      throw createError(403, 'you are not the owner of this note');
    }
    const result = await NoteModel.findByIdAndUpdate(id, { title, content }, { new: true });
    return { message: 'note updated successfully', status: 200, data: result };
  } catch (error) {
    throw createError(409, error);
  }
};

export const replaceNote = async (id, userId, { title, content }) => {
  try {
    const note = await NoteModel.findById(id);
    if (!note) {
      throw createError(404, 'note not found');
    }
    if (note.userId != userId) {
      throw createError(403, 'you are not the owner of this note');
    }
    const result = await NoteModel.findByIdAndUpdate(
      id,
      { title, content },
      { runValidators: true, returnDocument: 'after' }
    );
    return { message: 'note replaced successfully', status: 200, data: result };
  } catch (error) {
    throw createError(409, error);
  }
};

export const updateAll = async (userId, { title }) => {
  try {
    const account = await NoteModel.find({ userId });
    if (account) {
      const result = await NoteModel.updateMany({ userId }, { $set: { title } });
      return { message: 'all note updated successfully', status: 200, data: result };
    } else {
      throw createError(409, 'note not found');
    }
  } catch (error) {
    throw createError(409, error);
  }
};

export const deleteNote = async (userId, id) => {
  try {
    const note = await NoteModel.findById(id);
    if (note && note.userId == userId) {
      const result = await NoteModel.deleteOne({ _id: id });
      return { message: 'note deleted successfully', status: 200, data: result };
    } else {
      throw createError(409, 'you are not the owner of this note');
    }
  } catch (error) {
    throw createError(409, error);
  }
};

export const getNotesPaginated = async (userId, page, limit) => {
  try {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);

    const startIndex = (validPage - 1) * validLimit;

    const notes = await NoteModel.find({ userId }).skip(startIndex).limit(validLimit);

    return {
      message: 'ok',
      status: 200,
      data: notes,
    };
  } catch (error) {
    console.log({ err: error.message });
  }
};

export const getNoteById = async (noteId, userId) => {
  try {
    const note = await NoteModel.findById(noteId);

    if (note === null) {
      return { message: 'note not found ', status: 404 };
    }
    if (note?.userId.toString() !== userId) {
      return { message: 'you are not owner that note ', status: 409 };
    }
    return { message: 'ok', status: 200, data: note };
  } catch (error) {
    console.log({ err: error.message });
  }
};

export const getByContent = async (content) => {
  try {
    console.log({ content });

    const note = await NoteModel.findOne({ content });
    if (note === null) {
      return { message: 'note not found ', status: 404, data: note };
    } else {
      return { message: 'ok', status: 200, data: note };
    }
  } catch (error) {
    console.log({ err: error.message });
  }
};

export const getNotes = async (userId) => {
  try {
    const notes = await NoteModel.find({ userId })
      .select('title createdAt userId')
      .populate({ path: 'userId', select: 'email -_id' });

    return { message: 'ok', status: 200, data: notes };
  } catch (error) {
    console.log({ err: error.message });
  }
};

export const getNoteTitleAggregate = async (title) => {
  try {
    const notes = await NoteModel.aggregate([
      {
        $match: {
          title: title,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 0,
          userId: 1,
          title: 1,
          createdAt: 1,
          'user.name': 1,
          'user.email': 1,
        },
      },
    ]);

    return {
      message: 'ok',
      status: 200,
      data: notes,
    };
  } catch (error) {
    console.log({ err: error.message });
  }
};

export const deleteAllNotes = async (userId) => {
  try {
    const result = await NoteModel.deleteMany({ userId });
    console.log(result);
    return { message: 'deleted', status: 200 };
  } catch (error) {
    console.log({ err: error.message });
  }
};
