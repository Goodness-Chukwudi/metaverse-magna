import BaseRouterMiddleware from "./BaseRouterMiddleware";
import { USER_LABEL, USER_PASSWORD_LABEL } from '../common/constant/app_constants';
import { NextFunction, Request, Response, Router } from 'express';
import { logoutUser } from "../services/user_service";
import { passwordRepository } from "../services/password_service";
import * as errorMessage from "../common/constant/error_response_message";
import { PASSWORD_STATUS } from "../data/enums/enum";
import { hashData, validateHashedData } from "../common/utils/auth_utils";

class UserMiddleware extends BaseRouterMiddleware {

    constructor(appRouter: Router) {
        super(appRouter)
    }

    /**
     * A middleware that fetches a user from the db using the email provided in the request.
     * - The fetched user is available through the getDataFromState or getRequestUser method of the request service
    */
    public loadUserToRequestByEmail = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const email = req.body.email;
            if (!email) {
                const error = new Error("email is required");
                return this.sendErrorResponse(res, error, errorMessage.requiredField("Email"), 400);
            }
    
            const password = await passwordRepository
                .findOneBy({
                    email: email,
                    status: PASSWORD_STATUS.ACTIVE
                })
    
            if (!password) {
                return this.sendErrorResponse(res, new Error("User not found"), errorMessage.INVALID_LOGIN, 400)
            }
            this.requestUtils.addDataToState(USER_LABEL, password.user);
            this.requestUtils.addDataToState(USER_PASSWORD_LABEL, password);
            next();
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hashes a new password.
     * - Returns an invalid login error response for invalid password
    */
    public hashNewPassword = async (req: Request, res: Response, next: any) => {
        try {
            if (req.body.new_password) {
    
                if (req.body.confirm_password !== req.body.new_password) {
                    const error = new Error("Passwords do not match");
                    return this.sendErrorResponse(res, error, errorMessage.PASSWORD_MISMATCH, 400);
                }
    
                req.body.password = await hashData(req.body.new_password);
    
                next();
            } else {
                const error  =  new Error("No password provided");
                return this.sendErrorResponse(res, error, errorMessage.requiredField("New password"), 400)
            }
            
        } catch (error:any) {
            this.sendErrorResponse(res, error, errorMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
        }

    }

    /**
     * Validates user's password.
     * Returns an invalid login error response for invalid password
    */
    public validatePassword = async (req: Request, res: Response, next: any) => {
        try {
            const password = this.requestUtils.getDataFromState(USER_PASSWORD_LABEL);
            if (!password) {
                const user = this.requestUtils.getRequestUser();
                const password = await passwordRepository
                    .findOneBy({
                        email: user.email,
                        status: PASSWORD_STATUS.ACTIVE
                    })
                
                this.requestUtils.addDataToState(USER_PASSWORD_LABEL, password);
            }

            const isCorrectPassword = await validateHashedData(req.body.password, password.password);
            if (!isCorrectPassword) return this.sendErrorResponse(res, new Error("Wrong password"), errorMessage.INVALID_LOGIN, 400);

            next();
        } catch (error:any) {
            return this.sendErrorResponse(res, error, errorMessage.UNABLE_TO_COMPLETE_REQUEST, 500);
        }

    }

    /**
     * Logs out the user from other devices who's session hasn't expired yet.
    */
    public logoutExistingSession = async (req: Request, res: Response, next: any) => {
        try {
            
            const user = this.requestUtils.getRequestUser();
            await logoutUser(user.id);
            next();
        } catch (error: any) {
            return this.sendErrorResponse(res, error, errorMessage.UNABLE_TO_LOGIN, 500);
        }
    }
}

export default UserMiddleware;
