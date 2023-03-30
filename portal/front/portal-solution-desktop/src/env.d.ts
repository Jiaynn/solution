/// <reference types="vite/client" />

interface ImportMetaEnv extends Readonly<Record<string, unknown>> {
  readonly MAIN_VITE_NODE_ENV: 'dev' | 'staging' | 'prod'
  readonly MAIN_VITE_BASE_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
