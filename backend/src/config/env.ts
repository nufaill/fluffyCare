import dotenv from 'dotenv';

dotenv.config()

export const config = {
    cors: {
        ALLOWED_ORIGIN: process.env.CORS_ALLOWED_ORIGIN || "http://localhost:5173"
    },
    database: {
        URI: process.env.DATABASE_URI || ""
    },
    server: {
        PORT: process.env.PORT || 5000,
        NODE_ENV: process.env.NODE_ENV || 'dev'
    },
    nodemailer: {
        EMAIL_USER: process.env.SMTP_EMAIL,
        EMAIL_PASS: process.env.SMTP_PASS,
    },
    jwt: {
        ACCESS_SECRET_KEY: process.env.JWT_ACCESS_KEY || "access-secret-key",
        ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN ||"15m",
        REFRESH_SECRET_KEY: process.env.JWT_REFRESH_KEY || "refresh-secret-key",
        REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
        RESET_SECRET_KEY: process.env.JWT_RESET_KEY || "reset-secret-key",
        RESET_EXPIRES_IN: process.env.JWT_RESET_EXPIRES_IN || "5m",
    },
    OtpExpiry: process.env.OTP_EXPIRY_IN_MINUTES || "2",
    loggerStatus: process.env.LOGGER_STATUS || "dev",
    bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10),
    cloudinary: {
        SECRET_KEY: process.env.CLOUDINARY_API_SECRET,
        UPLOAD_PRESET: process.env.UPLOAD_PRESET
    }
}