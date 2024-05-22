import { AppDataSource } from "../data-source";
import { PASSWORD_STATUS } from "../data/enums/enum";
import User from "../entity/User";
import UserPassword from "../entity/UserPassword";


const passwordRepository = AppDataSource.getRepository(UserPassword);

const updateUserPassword = async (user: User, passwordHash:string, oldPassword: UserPassword) => {
    try {
        await AppDataSource.transaction(async (transactionalEntityManager) => {
         const password = transactionalEntityManager.create(UserPassword, {
            password: passwordHash,
            email: user.email,
            user: user
         })
         await transactionalEntityManager.save(password);
         //Deactivate old password
         oldPassword.status = PASSWORD_STATUS.DEACTIVATED;
         await transactionalEntityManager.save(oldPassword);
        });
        
    } catch (error) {
        throw error;
    }
}

export { passwordRepository, updateUserPassword };