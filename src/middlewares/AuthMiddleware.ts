import BaseRouterMiddleware from "./BaseRouterMiddleware";
import { USER_LABEL } from "../common/constant/app_constants";
import { Request, Response, Router } from "express";
import { LOGIN_SESSION_LABEL } from "../common/constant/app_constants";
import { TokenExpiredError } from "jsonwebtoken";
import { getTokenFromRequest, verifyJwtToken } from "../common/utils/auth_utils";
import * as errorResponse from "../common/constant/error_response_message";
import { BIT } from "../data/enums/enum";
import { loginSessionRepository } from "../services/login_session_service";
import { AuthTokenPayload } from "../data/interfaces/interfaces";
import { userRepository } from "../services/user_service";
import LoginSession from "../entity/LoginSession";

export class AuthMiddleware extends BaseRouterMiddleware {

    constructor(appRouter: Router) {
        super(appRouter);
    }

    public authGuard = (req: Request, res: Response, next: any) => {
        
        const jwt = getTokenFromRequest(req);
        
        verifyJwtToken(jwt, async (error, decoded) => {
            try {
                if (error) {
                    if (error instanceof TokenExpiredError)
                        return this.sendErrorResponse(res, error, errorResponse.SESSION_EXPIRED, 401);
    
                    return this.sendErrorResponse(res, error, errorResponse.INVALID_TOKEN, 401);
                } else {
                    const data:AuthTokenPayload = decoded.data;
                    const loginSession = await loginSessionRepository
                        .findOneBy({
                            id: data.loginSession,
                            user_id: data.user,
                            status: BIT.ON
                        })
                    
                    if (loginSession) {                
                        await this.validateLoginSession(loginSession, req, res);
                        const user = await userRepository
                            .findOneBy({
                                id: loginSession.user_id,
                            })
                        
                        this.requestUtils.addDataToState(USER_LABEL, user);
                        this.requestUtils.addDataToState(LOGIN_SESSION_LABEL, loginSession);

                        next();
                    } else {
                        const error =  new Error("Unable to validate user from token");
                        this.sendErrorResponse(res, error, errorResponse.INVALID_SESSION_USER, 401);
                    }
                }
            } catch (error:any) {
                console.log(error)
                this.sendErrorResponse(res, error, errorResponse.UNABLE_TO_COMPLETE_REQUEST, 401);
            }
        })
    }

    private async validateLoginSession(loginSession: LoginSession, req: Request, res: Response): Promise<void> {
        try {
            if (loginSession.validity_end_date <= new Date()) {
                loginSession.is_expired = true;
                loginSession.status = BIT.OFF;
                await loginSessionRepository.save(loginSession);
                const error = new Error("Session expired");
                return this.sendErrorResponse(res, error, errorResponse.SESSION_EXPIRED, 401);
            }
            
        } catch (error) {
            throw error;
        }
    }
}

export default AuthMiddleware;
