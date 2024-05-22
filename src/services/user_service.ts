import { BIT } from '../data/enums/enum';
import { loginSessionRepository } from './login_session_service';
import { createAuthToken } from '../common/utils/auth_utils';
import { AppDataSource } from '../data-source';
import User from '../entity/User';
import { ILoginSession, IUser } from '../data/interfaces/interfaces';
import UserPassword from '../entity/UserPassword';
import LoginSession from '../entity/LoginSession';

const userRepository = AppDataSource.getRepository(User)

const createNewUser = async (userData: Partial<IUser>, passwordHash:string): Promise<{user: User, token: string}> => {
 return new Promise(async (resolve, reject) => {
    try {
        let token = "";
        let loginSession, user;
        await AppDataSource.transaction(async (transactionalEntityManager) => {
            user = transactionalEntityManager.create(User, {
                first_name: userData.first_name,
                last_name: userData.last_name,
                middle_name: userData.middle_name,
                email: userData.email
            })
            const password = transactionalEntityManager.create(UserPassword, {
                password: passwordHash,
                email: user.email
            })

            user.password = password;
            password.user = user;
            
            await transactionalEntityManager.save(user);
            await transactionalEntityManager.save(password);

            loginSession = await transactionalEntityManager.create(LoginSession, {
                user_id: user.id,
                status: BIT.ON
            });

            token = createAuthToken(user.id, loginSession.id);
        });
        if (!user || !token) throw new Error("Error creating user");

        resolve({user, token});
    } catch (error) {
        reject(error);
    }
 })
}

const logoutUser = async (userId: number): Promise<ILoginSession> => {
 return new Promise(async (resolve, reject) => {
    try {
        let activeLoginSession = await loginSessionRepository
        .findOneBy({
            status: BIT.ON,
            user_id: userId
        })

        if(activeLoginSession) {
            if (activeLoginSession.validity_end_date > new Date()) {
                activeLoginSession.logged_out = true;
                activeLoginSession.validity_end_date = new Date();
            } else {
                activeLoginSession.is_expired = true
            }
            activeLoginSession.status = BIT.OFF;
            activeLoginSession = await loginSessionRepository.save(activeLoginSession);
        }
        resolve(activeLoginSession!);

    } catch (error) {
        reject(error);
    }
 })
}

const loginUser = async (userId: number): Promise<string> => {
    return new Promise(async (resolve, reject) => {
       try {
           const loginSessionData = new LoginSession()
           loginSessionData.user_id = userId;
           loginSessionData.status = BIT.ON;
           const loginSession = await loginSessionRepository.save(loginSessionData);
           const token = createAuthToken(userId, loginSession.id);
           resolve(token);
       } catch (error) {
           reject(error);
       }
    })
}

export {
    userRepository,
    logoutUser,
    loginUser,
    createNewUser
 };
