import "dotenv/config";

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:8080',
  ASSIGNMENT_SEED: process.env.ASSIGNMENT_SEED || 'FRONT25-XXXX',
  JWT_SECRET: process.env.JWT_SECRET || 'change-me',
  ROLLNO: process.env.ROLLNO || 'roll',
};
