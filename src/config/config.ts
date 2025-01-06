// use docker compose services by default

export default () => ({
  database: {
    host: process.env.DB_URI || 'mongodb://127.0.0.1:27017',
    db_name: process.env.DB_NAME || 'main_db',
    tenant_prefix: process.env.TENANT_PREFIX || 'tenant',
  },
  cache: {
    host: process.env.REDIS_URI || '127.0.0.1:6379',
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD || '',
  },
  auth: {
    user: {
      public_key: process.env.USER_JWT_PUBLIC || '',
      private_key: process.env.USER_JWT_PRIVATE || '',
      expiration_minutes: process.env.USER_JWT_EXPIRATION || '60',
    }, // normal user auth
    email: {
      public_key: process.env.EMAIL_JWT_PUBLIC || '',
      private_key: process.env.USER_JWT_PRIVATE || '',
      expiration_minutes: process.env.EMAIL_JWT_EXPIRATION || '360',
    }, // email jwt auth
  },
});
