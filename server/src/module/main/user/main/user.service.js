import { UserModel } from '#/database/index.js';
import createError from 'http-errors';
export const signup = async ({ name, email, password, phone, age }) => {
  try {
    const account = await UserModel.findOne({ email });
    if (!account) {
      const result = await UserModel.create({ name, email, password, phone, age });
      return { message: 'account created successfully', status: 200, data: result };
    } else {
      throw createError(409, 'account created before');
    }
  } catch (error) {
    throw createError(409, error);
  }
};

export const login = async ({ email, password }) => {
  try {
    const account = await UserModel.findOne({ email, password });
    if (account) {
      return { message: 'login successfully', status: 200, data: account };
    } else {
      throw createError(404, 'account not found');
    }
  } catch (error) {
    throw createError(409, error);
  }
};

export const updateUser = async (id, { name, email, age }) => {
  try {
    const isDuplicated = await UserModel.findOne({ email });
    if (isDuplicated) {
      throw createError(409, 'this email is already exit');
    }
    const account = await UserModel.findByIdAndUpdate(id, { name, email, age }, { new: true });
    if (account) {
      return { message: 'account updated successfully', status: 200, data: account };
    } else {
      throw createError(404, 'account not found');
    }
  } catch (error) {
    throw createError(409, error);
  }
};

export const deleteUser = async (id) => {
  try {
    const account = await UserModel.findByIdAndDelete(id);
    if (account) {
      return { message: 'account deleted successfully ', status: 200 };
    } else {
      throw createError(404, 'account not found');
    }
  } catch (error) {
    throw createError(409, error);
  }
};

export const getUser = async (id) => {
  try {
    const account = await UserModel.findById(id);
    if (account) {
      return { message: 'done', status: 200, data: account };
    } else {
      throw createError(404, 'account not found');
    }
  } catch (error) {
    throw createError(409, error);
  }
};
