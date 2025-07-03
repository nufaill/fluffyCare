// backend/src/validations/shopVerification.validation.ts
import Joi from 'joi';

export const shopRejectionSchema = Joi.object({
  rejectionReason: Joi.string()
    .min(10)
    .max(500)
    .optional()
    .messages({
      'string.min': 'Rejection reason must be at least 10 characters long',
      'string.max': 'Rejection reason cannot exceed 500 characters'
    })
});

export const shopIdParamSchema = Joi.object({
  shopId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Shop ID must be a valid MongoDB ObjectId',
      'any.required': 'Shop ID is required'
    })
});