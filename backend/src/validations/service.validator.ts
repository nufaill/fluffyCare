import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { HTTP_STATUS, ERROR_MESSAGES } from '../shared/constant';

export const validateCreateService: RequestHandler[] = [
    body('name')
        .notEmpty()
        .withMessage('Service name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Service name must be between 2 and 100 characters')
        .trim(),

    body('description')
        .notEmpty()
        .withMessage('Service description is required')
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters')
        .trim(),

    body('serviceTypeId')
        .notEmpty()
        .withMessage('Service type is required')
        .isMongoId()
        .withMessage('Invalid service type ID'),

    body('price')
        .isNumeric()
        .withMessage('Price must be a number')
        .isFloat({ min: 0 })
        .withMessage('Price must be greater than or equal to 0'),

    body('durationHoure')
        .isNumeric()
        .withMessage('Duration must be a number')
        .isFloat({ min: 0.25 })
        .withMessage('Duration must be at least 0.25 hours'),

    body('isActive')
        .optional()
        .isBoolean()
        .withMessage('isActive must be a boolean'),

    body('petTypeIds')
        .isArray({ min: 1 })
        .withMessage('At least one pet type must be selected'),

    body('petTypeIds.*')
        .isMongoId()
        .withMessage('Each pet type ID must be a valid Mongo ID'),

    // Cast this function to a RequestHandler
    ((req: Request, res: Response, next: NextFunction) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(HTTP_STATUS.BAD_REQUEST).json({
                success: false,
                message: ERROR_MESSAGES.VALIDATION_ERROR,
                errors: errors.array()
            });
        }
        next();
    }) as RequestHandler
];
