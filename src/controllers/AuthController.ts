import BaseApiController from "./base controllers/BaseApiController";
import { UNABLE_TO_COMPLETE_REQUEST, UNABLE_TO_LOGIN } from "../common/constant/error_response_message";
import { LOGIN_SUCCESSFUL, SIGNUP_SUCCESS } from "../common/constant/success_response_message";
import AppValidator from "../middlewares/validators/AppValidator";
import { createNewUser, loginUser } from "../services/user_service";

class AuthController extends BaseApiController {

    appValidator: AppValidator;

    constructor() {
        super();
    }

    protected initializeServices() {}
    
    protected initializeMiddleware() {
        this.appValidator = new AppValidator(this.router);
    }

    protected initializeRoutes() {
        this.login("/login"); //POST
        this.signup("/signup"); //POST
    }

    signup(path:string) {
        this.router.post(path, this.appValidator.validateUserSignup, this.userMiddleWare.hashNewPassword);
        this.router.post(path, async (req, res) => {
            try {
                const body = req.body;
                const userData = {
                    first_name: body.first_name,
                    last_name: body.last_name,
                    middle_name: body.middle_name,
                    email: body.email
                }
                const { user, token } = await createNewUser(userData, body.password);
                const response = {
                    message: SIGNUP_SUCCESS,
                    token: token,
                    user: user
                }

                return this.sendSuccessResponse(res, response, 201);
            } catch (error:any) {
                this.sendErrorResponse(res, error, UNABLE_TO_COMPLETE_REQUEST, 500);
            }
        });
    }

    login(path:string) {
        this.router.post(path,
            this.appValidator.validateUserLogin,
            this.userMiddleWare.loadUserToRequestByEmail,
            this.userMiddleWare.validatePassword,
            this.userMiddleWare.logoutExistingSession
        );

        this.router.post(path, async (req, res) => {
            try {
                const user = this.requestUtils.getRequestUser();
                const token = await loginUser(user.id);
                const response = {
                    message: LOGIN_SUCCESSFUL,
                    token: token,
                    user: user
                }

                return this.sendSuccessResponse(res, response);
            } catch (error:any) {
                this.sendErrorResponse(res, error, UNABLE_TO_LOGIN, 500);
            }
        });
    }
}

export default new AuthController().router;
