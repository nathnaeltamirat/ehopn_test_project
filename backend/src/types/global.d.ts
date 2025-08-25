declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      PORT?: string;
      MONGODB_URI: string;
      JWT_SECRET: string;
      CHAPA_PUBLIC_KEY: string;
      CHAPA_SECRET_KEY: string;
      CHAPA_ENCRYPTION_KEY: string;
      GEMINI_API_KEY: string;
      GOOGLE_CLIENT_ID: string;
      GOOGLE_CLIENT_SECRET: string;
      FRONTEND_URL: string;
      EMAIL_USER: string;
      EMAIL_PASSWORD: string;
    }
  }

  var fetch: any;
}

export {};
