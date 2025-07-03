export enum HTTP_STATUS {
  OK = 200,
  CREATED = 201,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
  GONE = 410,
};


export const SUCCESS_MESSAGES = {
  OPERATION_SUCCESS: "Opearation Succesfull",
  CREATED: "Created successfully.",
  LOGIN_SUCCESS: "Login successful.",
  REGISTRATION_SUCCESS: "Registration completed successfully.",
  OTP_SEND_SUCCESS: "OTP sent successfully",
  LOGOUT_SUCCESS: "Logged out successfully.",
  UPDATE_SUCCESS: "Updated successfully.",
  DELETE_SUCCESS: "Deleted successfully.",
  PASSWORD_RESET_SUCCESS: "Password reset successfully.",
  VERIFICATION_SUCCESS: "Verification completed successfully.",
  DATA_RETRIEVED_SUCCESS: "Data fetched successfully",
  ADDED_WHISHLIST: "Item added to whishlist",
  ALREADY_WISHLIST: "Item alredy in wishlist",
  REMOVED_WHISHLIST: "Item removed from wishlist",
  USERS_FETCHED_SUCESS: "Users fetched successfully",
  PROFILE_FETCHED_SUCCESS: 'Profile fetched successfully',
  PROFILE_UPDATED_SUCCESS: 'Profile updated successfully'
};



export const ERROR_MESSAGES = {
  ADMIN_BLOCKED: "Account is Blocked by admin",
  ADMIN_DONOT_ACCEPTED: "Admin Must Verify First",
  OTP_SEND_FAILED: "OTP sent failed",
  OTP_INVALID: "Invalid OTP",
  OTP_EXPIRED: "OTP has Expired",
  INVALID_ROLE: "Invalid user role",
  UNAUTH_NO_USER_FOUND: "Unauthorized: No user found in request",
  INCOMPLETE_INFO: "Incomplete information.",
  ID_REQUIRED: "ID required",
  TOKEN_EXPIRED: "Token Expired",
  EMAIL_NOT_FOUND: "Email Not Found",
  FORBIDDEN:
    "Access denied. You do not have permission to access this resource.",
  BLOCKED: "Your account has been blocked.",
  NOT_ALLOWED: "You are not allowed",
  EMAIL_EXISTS: "Email Already Exists",
  INVALID_TOKEN: "Invalid token",
  INVALID_CREDENTIALS: "Invalid credentials provided.",
  USER_NOT_FOUND: "User not found.",
  USERS_FETCHED_FAILED: "Failed to fetch users",
  UNAUTHORIZED_ACCESS: "Unauthorized access.",
  SERVER_ERROR: "An error occurred, please try again later.",
  VALIDATION_ERROR: "Validation error occurred.",
  MISSING_PARAMETERS: "Missing required parameters.",
  ROUTE_NOT_FOUND: "Route not found.",
  ID_NOT_PROVIDED: "ID not provided",
  INVALID_PASSWORD: "Password Doesnot Match",
  GOOGLE_USER:
    "This user is an google auth user no password change is possible",
  NO_REFRESH_TOKEN: "There is no refresh token",
  IS_ACTIVE_ERROR: "isActive must be a boolean value",
  PROFILE_FETCHED_FAILED: 'Failed to fetch profile',
  PROFILE_UPDATE_FAILED: 'Failed to update profile',
  INVALID_LOCATION: 'Location must be a valid GeoJSON Point',
  INVALID_INPUT: 'At least one field must be provided for update',
};