import z from 'zod';

import packageJSON from './package.json';

// Single unified environment schema
const envSchema = z.object({
  EXPO_PUBLIC_APP_ENV: z.enum(['development', 'preview', 'production']),
  EXPO_PUBLIC_NAME: z.string(),
  EXPO_PUBLIC_SCHEME: z.string(),
  EXPO_PUBLIC_BUNDLE_ID: z.string(),
  EXPO_PUBLIC_PACKAGE: z.string(),
  EXPO_PUBLIC_VERSION: z.string(),
  EXPO_PUBLIC_API_URL: z.string().url(),
  EXPO_PUBLIC_WEBSOCKET_URL: z.string().url().optional(),
  EXPO_PUBLIC_BLE_AES_KEY: z.string().length(16).default('1234567890123456'),
  EXPO_PUBLIC_BLE_SERVICE_UUID: z.string().uuid().default('55535343-fe7d-4ae5-8fa9-9fafd205e455'),
  EXPO_PUBLIC_BLE_TX_UUID: z.string().uuid().default('49535343-8841-43f4-a8d4-ecbe34729bb3'),
  EXPO_PUBLIC_BLE_RX_UUID: z.string().uuid().default('49535343-1e4d-4bd9-ba61-23c647249616'),
  EXPO_PUBLIC_AP_SSID_PREFIX: z.string().default('EEC_'),
  EXPO_PUBLIC_AP_GATEWAY_IP: z.string().default('192.168.4.1'),
  EXPO_PUBLIC_AP_PORT: z.string().default('8080'),
  CLOUDINARY_UPLOAD_CLOUD_NAME: z.string().default(''),
  CLOUDINARY_UPLOAD_API_KEY: z.string().default(''),
  CLOUDINARY_UPLOAD_API_SECRET: z.string().default(''),
  CLOUDINARY_UPLOAD_PRESET: z.string().default(''),
});

// Config records per environment
const EXPO_PUBLIC_APP_ENV = (process.env.EXPO_PUBLIC_APP_ENV ?? 'development') as z.infer<typeof envSchema>['EXPO_PUBLIC_APP_ENV'];

const BUNDLE_IDS = {
  development: 'sensasmart.development',
  preview: 'sensasmart.preview',
  production: 'sensasmart',
} as const;

const PACKAGES = {
  development: 'sensasmart.development',
  preview: 'sensasmart.preview',
  production: 'sensasmart',
} as const;

const SCHEMES = {
  development: 'sensasmart',
  preview: 'sensasmart.preview',
  production: 'sensasmart',
} as const;

const NAME = 'Sensa Smart';

// Check if strict validation is required (before prebuild)
const STRICT_ENV_VALIDATION = process.env.STRICT_ENV_VALIDATION === '1';

// Build env object
const _env: z.infer<typeof envSchema> = {
  EXPO_PUBLIC_APP_ENV,
  EXPO_PUBLIC_NAME: NAME,
  EXPO_PUBLIC_SCHEME: SCHEMES[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_BUNDLE_ID: BUNDLE_IDS[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_PACKAGE: PACKAGES[EXPO_PUBLIC_APP_ENV],
  EXPO_PUBLIC_VERSION: packageJSON.version,
  EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL ?? '',
  EXPO_PUBLIC_WEBSOCKET_URL: process.env.EXPO_PUBLIC_WEBSOCKET_URL,
  EXPO_PUBLIC_BLE_AES_KEY: process.env.EXPO_PUBLIC_BLE_AES_KEY ?? '1234567890123456',
  EXPO_PUBLIC_BLE_SERVICE_UUID: process.env.EXPO_PUBLIC_BLE_SERVICE_UUID ?? '55535343-fe7d-4ae5-8fa9-9fafd205e455',
  EXPO_PUBLIC_BLE_TX_UUID: process.env.EXPO_PUBLIC_BLE_TX_UUID ?? '49535343-8841-43f4-a8d4-ecbe34729bb3',
  EXPO_PUBLIC_BLE_RX_UUID: process.env.EXPO_PUBLIC_BLE_RX_UUID ?? '49535343-1e4d-4bd9-ba61-23c647249616',
  EXPO_PUBLIC_AP_SSID_PREFIX: process.env.EXPO_PUBLIC_AP_SSID_PREFIX ?? 'EEC_',
  EXPO_PUBLIC_AP_GATEWAY_IP: process.env.EXPO_PUBLIC_AP_GATEWAY_IP ?? '192.168.4.1',
  EXPO_PUBLIC_AP_PORT: process.env.EXPO_PUBLIC_AP_PORT ?? '8080',
  CLOUDINARY_UPLOAD_CLOUD_NAME: process.env.CLOUDINARY_UPLOAD_CLOUD_NAME ?? '',
  CLOUDINARY_UPLOAD_API_KEY: process.env.CLOUDINARY_UPLOAD_API_KEY ?? '',
  CLOUDINARY_UPLOAD_API_SECRET: process.env.CLOUDINARY_UPLOAD_API_SECRET ?? '',
  CLOUDINARY_UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET ?? '',
};

function getValidatedEnv(env: z.infer<typeof envSchema>) {
  const parsed = envSchema.safeParse(env);

  if (parsed.success === false) {
    const errorMessage
      = `❌ Invalid environment variables:${
        JSON.stringify(parsed.error.flatten().fieldErrors, null, 2)
      }\n❌ Missing variables in .env file for APP_ENV=${EXPO_PUBLIC_APP_ENV}`
      + `\n💡 Tip: If you recently updated the .env file, try restarting with -c flag to clear the cache.`;

    if (STRICT_ENV_VALIDATION) {
      console.error(errorMessage);
      throw new Error('Invalid environment variables');
    }
  }
  else {
    console.log('✅ Environment variables validated successfully');
  }

  return parsed.success ? parsed.data : env;
}

const Env = STRICT_ENV_VALIDATION ? getValidatedEnv(_env) : _env;

export default Env;
