/// <reference types="vite/client" />

// declare global {
//   interface Window {
//     google: typeof google;
//   }
// }

interface ImportMetaEnv {
  readonly VITE_GOOGLE_MAPS_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

export {};