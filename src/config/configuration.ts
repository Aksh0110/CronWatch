export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cronwatch',
  appName: process.env.APP_NAME || 'CronWatch',
  jwtSecret: process.env.JWT_SECRET || 'super_secret_cronwatch_key_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
});

