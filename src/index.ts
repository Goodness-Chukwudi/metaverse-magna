import app from "./App";
import Env from './common/config/environment_variables';
import { ENVIRONMENTS} from './common/config/app_config';
import validateEnvironmentVariables from './common/utils/env_validator';
import { createSocketConnection, fetchBlockAndProcessTransactions } from "./services/transaction_service";
import cron from "node-cron";

validateEnvironmentVariables();

const server = app.listen(Env.PORT, async () => {
  if (Env.ENVIRONMENT == ENVIRONMENTS.DEV)
      console.log(`Express is listening on http://localhost:${Env.PORT}${Env.API_PATH}`);
    await createSocketConnection(server);

    await fetchBlockAndProcessTransactions()
    cron.schedule('0 0 1 * *', async () => {
    });
});

process.on('unhandledRejection', (reason: string, p: Promise<any>) => {
  console.error('Unhandled Rejection at:\n', p);
  console.log("\n")
  console.error('Reason:\n', reason);
  //Track error with error logger
  
  process.exit(1);
  //Restart with pm2 in production
});

process.on('uncaughtException', (error: Error) => {
  console.error(`Uncaught exception:`);
  console.log("\n")
  console.error(error);
  //Track error with error logger

  process.exit(1);
  //Restart with pm2 in production
});
