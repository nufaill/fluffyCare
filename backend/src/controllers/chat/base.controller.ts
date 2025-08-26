import { Response } from 'express';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export abstract class BaseController {
  protected sendSuccessResponse<T>(
    res: Response, 
    statusCode: number, 
    message: string, 
    data?: T
  ): void {
    const response: ApiResponse<T> = {
      success: true,
      message,
      ...(data !== undefined && { data }),
    };
    res.status(statusCode).json(response);
  }

  protected sendErrorResponse(
    res: Response, 
    statusCode: number, 
    message: string, 
    error?: string
  ): void {
    const response: ApiResponse = {
      success: false,
      message,
      ...(error && { error }),
    };
    res.status(statusCode).json(response);
  }

  protected handleControllerError(
    res: Response, 
    error: unknown, 
    defaultMessage: string
  ): void {
    console.error(`Controller Error: ${defaultMessage}`, error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    this.sendErrorResponse(res, 500, defaultMessage, errorMessage);
  }

  protected validateRequiredFields(fields: Record<string, any>): string | null {
    for (const [key, value] of Object.entries(fields)) {
      if (value === undefined || value === null || value === '') {
        return `${key} is required`;
      }
    }
    return null;
  }

  protected parseIntOrDefault(value: string | undefined, defaultValue: number): number {
    if (!value) return defaultValue;
    const parsed = parseInt(value, 10);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  protected validateEnum(value: string, validValues: string[], fieldName: string): string | null {
    if (!validValues.includes(value)) {
      return `${fieldName} must be one of: ${validValues.join(', ')}`;
    }
    return null;
  }

  protected validatePagination(page: number, limit: number): string | null {
    if (page < 1) {
      return 'Page must be greater than 0';
    }
    if (limit < 1 || limit > 100) {
      return 'Limit must be between 1 and 100';
    }
    return null;
  }
}