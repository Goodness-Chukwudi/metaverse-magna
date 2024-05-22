import RequestUtils from "../common/utils/RequestUtils";
import BaseResponseHandler from "../controllers/base controllers/BaseResponseHandlerController";
import { Router } from "express";

/**
 * An abstract class that provides a base middleware for all routers.
 * Middleware classes that extend this class get access to:
 * - an instance of RequestUtils
 * - Other non private members of the BaseResponseHandler class
 * - The express router of the request
*/
abstract class BaseRouterMiddleware extends BaseResponseHandler {

    public router;
    protected requestUtils: RequestUtils;


    constructor(appRouter: Router) {
        super();
        this.router = appRouter;
        this.requestUtils = new RequestUtils(this.router);
    }
}

export default BaseRouterMiddleware;
