import { AppDataSource } from "../data-source";
import LoginSession from "../entity/LoginSession";


const loginSessionRepository = AppDataSource.getRepository(LoginSession)

export { loginSessionRepository };