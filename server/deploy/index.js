import { app } from '../src/app.bootstrap.js';
import { databaseConnection } from '../src/database/index.js';

let connected = false;

export default async function handler(req, res) {
  try {
    if (!connected) {
      await databaseConnection;
      connected = true;

      console.log('Database connected successfully');
    }

    return app(req, res);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
}