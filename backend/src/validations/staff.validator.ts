// staff.validator.ts
import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { HTTP_STATUS } from '../shared/constant';
import { CustomError } from '../util/CustomerError'; 

export const validateCreateStaff = [
  // body('name')
  //   .notEmpty()
  //   .withMessage('Name is required')
  //   .isString()
  //   .withMessage('Name must be a string'),
  // body('email')
  //   .notEmpty()
  //   .withMessage('Email is required')
  //   .isEmail()
  //   .withMessage('Invalid email format'),
  // body('shopId')
  //   .notEmpty()
  //   .withMessage('Shop ID is required')
  //   .isMongoId()
  //   .withMessage('Invalid shop ID format'),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new CustomError(
        'Validation failed: ' + JSON.stringify(errors.array()),
        HTTP_STATUS.BAD_REQUEST,
      );
    }
    next();
  },
];