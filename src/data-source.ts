import { DataSource } from "typeorm";
import Env from "./common/config/environment_variables";

const AppDataSource = new DataSource({
    type: "postgres",
    host: Env.DB_HOST,
    port: Env.DB_PORT,
    username: Env.DB_USER,
    password: Env.DB_PASSWORD,
    database: Env.DB_NAME,
    entities: ["src/entity/**/*.{js,ts}"],
    synchronize: true,
    logging: false
});
AppDataSource.initialize();

export { AppDataSource }