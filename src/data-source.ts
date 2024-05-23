import { DataSource } from "typeorm";

const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "enyata-user",
    password: "password",
    database: "metaverse-magna",
    entities: ["src/entity/**/*.ts"],
    // entities: ["dist/entity/**/*.js"],
    synchronize: true,
    logging: false
});

AppDataSource.initialize();

export { AppDataSource }