import joi, { Extension, Root } from "joi";

interface IResponseMessage {
    response_code: number;
    message: string;
}

interface IObjectIdExtension extends Extension {
    type: 'string',
    base: joi.StringSchema
    messages: {'string.objectId': string},
    rules: {
        objectId: { validate(value:string, helpers:any): any }
    }
}

declare const JoiExtensionFactory: (joi: Root) => IObjectIdExtension;

interface AuthTokenPayload {
    user: number;
    loginSession: number
}

interface IUser {
    id?: number;
    first_name: string;
    last_name: string;
    middle_name?: string;
    email: string;
    password?: IUserPassword;
    status?: string;
}

interface ILoginSession {
    id: number;
    user_id: number;
    validity_end_date: Date;
    logged_out: boolean;
    is_expired: boolean;
    status: number;
}

interface IUserPassword {
    id: number;
    password: string;
    email: string;
    user: number|IUser;
    status: string
}

interface ITransaction {
    sender_address: string;
    receiver_address: string;
    block_number: string;
    block_hash: string;
    transaction_hash: string;
    gas_price_in_wei: number
    value_in_wei: number
}

export {
    IResponseMessage,
    JoiExtensionFactory,
    AuthTokenPayload,
    IUser,
    ILoginSession,
    IUserPassword,
    ITransaction
}
