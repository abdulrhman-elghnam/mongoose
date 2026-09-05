import { mongoose } from './database.js';
import { config } from '../../config/index.js';
export const databaseConnection = mongoose.connect(config.DATABASE_URI);
