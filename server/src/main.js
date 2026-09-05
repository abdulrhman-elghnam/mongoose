import { app } from './app.bootstrap.js';
import { databaseConnection } from './database/index.js';
import { config } from './config/index.js';

const main = async () => {
  try {
    await databaseConnection;

    console.log({
      msg: 'database connected successfully',
    });

    app.listen(config.PORT, () => {
      console.log({
        msg: `server is running on port ${config.PORT}`,
      });
    });
  } catch (error) {
    console.error(error);
  }
};

main();
