import RandomString, { GenerateOptions } from 'randomstring';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response } from 'express';

const generateUUID = (): string => {
    try {
        return uuidv4();
    } catch (error) {
        throw error;
    }
}

/**
 * Generates an alphanumeric code
 * @param {number} length a number that specifies the length of the generated code. Default is 6
 * @param {boolean} capitalize a boolean that specifies if the letters should be uppercase or not. Default is false
 * @param {boolean} readable a boolean that specifies if only readable characters should be generated. Default is true
 * @returns {string} an alphanumeric string of the specified length
*/
const getCode = (length:number = 6, capitalize = false, readable = true): string => {
    try {
        const options: GenerateOptions = {
            length: length,
            readable: readable,
            charset: "alphanumeric",
        }
        if (capitalize) {
            options.capitalization = "uppercase";
        }
        return RandomString.generate(options);

    } catch (error) {
        throw error
    }
}

/**
 * Generates an alphabetic code.
 * @param {number} length a number that specifies the length of the generated code. Default is 6
 * @param {boolean} capitalize a boolean that specifies if the letters should be uppercase or not. Default is false
 * @returns {string} an alphabetic string of the specified length
*/
const getAlphaCode = (length:number = 6, capitalize:boolean = false): string => {
    try {
        const options:GenerateOptions = {
            length: length,
            charset: 'alphabetic'
        }
        if (capitalize) {
            options.capitalization = "uppercase";
        }
        return RandomString.generate(options);
        
    } catch (error) {
        throw error;
    }
}

/**
 * Converts a value to boolean
 * - "1", true, "true", "on", "yes", 1 converts to true while every other value converts to false
 * - value is not case sensitive
 * @param {string|boolean|number} value the value (of type string|boolean|number) to be converted
 * @returns {boolean} a boolean
*/
const convertToBoolean = (value: string|boolean|number): boolean => {
    try {
        if (typeof value === "string") value = value.toLowerCase();
        const allowedTruthValues = ["1", "true", "on", "yes", 1, true];
        
        if (allowedTruthValues.includes(value)) return true;
        return false;
        
    } catch (error) {
        throw error;
    }
}

/**
 * Records and logs the response time for http requests
 * @returns {void}
*/
const recordResponseTime = (req:Request, res:Response, time:number) => {
    console.log(`${req.method}: ${req.url} => ${time.toFixed(3)} ms `, res.statusCode);
}

export {
    convertToBoolean,
    getAlphaCode,
    getCode,
    generateUUID,
    recordResponseTime
};
