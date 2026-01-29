// Configuration file for environment variables
// This centralizes all environment variable access

// Backend configuration
export const BACKEND_HOST = import.meta.env.VITE_BACKEND_HOST;
export const BACKEND_PORT = 8000;

// Backend URLs
export const BACKEND_HTTP = `http://${BACKEND_HOST}:${BACKEND_PORT}`;
export const BACKEND_WS = `ws://${BACKEND_HOST}:${BACKEND_PORT}`;
