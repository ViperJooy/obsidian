/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_EMBY_SERVER_URL: string;
  readonly VITE_EMBY_DEVICE_ID: string;
  readonly VITE_EMBY_CLIENT_NAME: string;
  readonly VITE_EMBY_VERSION: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
