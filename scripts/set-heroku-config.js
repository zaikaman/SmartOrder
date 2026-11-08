const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// 1. Doc .env
const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};

envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
    const idx = trimmed.indexOf('=');
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim();
    env[key] = val;
  }
});

console.log('[CONFIG] Da doc bien moi truong tu .env thanh cong!');

const setConfig = (app, vars) => {
  console.log(`\n[HEROKU] Dang nap bien moi truong cho app: ${app}...`);
  const args = Object.entries(vars)
    .map(([k, v]) => `"${k}=${v}"`)
    .join(' ');
  const cmd = `heroku config:set ${args} --app ${app}`;
  try {
    execSync(cmd, { stdio: 'inherit', shell: 'cmd.exe' });
    console.log(`[HEROKU] Thanh cong cho ${app}!`);
  } catch (err) {
    console.error(`[HEROKU] Loi khi nap config cho ${app}:`, err.message);
  }
};

// 1. Auth Service
setConfig('bepviet-auth-service', {
  DB_URL: env.DB_URL,
  DB_USERNAME: env.DB_USERNAME,
  DB_PASSWORD: env.DB_PASSWORD,
  DB_DRIVER: env.DB_DRIVER,
  JWT_SECRET: env.JWT_SECRET,
  GOOGLE_CLIENT_ID: env.GOOGLE_CLIENT_ID,
});

// 2. Catalog Service
setConfig('bepviet-catalog-service', {
  DB_URL: env.DB_URL,
  DB_USERNAME: env.DB_USERNAME,
  DB_PASSWORD: env.DB_PASSWORD,
  DB_DRIVER: env.DB_DRIVER,
  JWT_SECRET: env.JWT_SECRET,
  CLOUDINARY_CLOUD_NAME: env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: env.CLOUDINARY_API_SECRET,
});

// 3. Booking Service
setConfig('bepviet-booking-service', {
  DB_URL: env.DB_URL,
  DB_USERNAME: env.DB_USERNAME,
  DB_PASSWORD: env.DB_PASSWORD,
  DB_DRIVER: env.DB_DRIVER,
  JWT_SECRET: env.JWT_SECRET,
  CATALOG_SERVICE_URL: 'https://bepviet-catalog-service-525768f2f99c.herokuapp.com',
  VNPAY_TMN_CODE: env.VNPAY_TMN_CODE,
  VNPAY_HASH_SECRET: env.VNPAY_HASH_SECRET,
  VNPAY_PAY_URL: env.VNPAY_PAY_URL,
  VNPAY_RETURN_URL: 'https://bepviet-restaurant.vercel.app/payment/vnpay-return',
  MAIL_HOST: env.MAIL_HOST,
  MAIL_PORT: env.MAIL_PORT,
  MAIL_USERNAME: env.MAIL_USERNAME,
  MAIL_PASSWORD: env.MAIL_PASSWORD,
});

console.log('\n[HEROKU] Da nap hoan tat toan bo Config Vars cho 3 ung dung!');
