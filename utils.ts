export function isDev() {
  return process.env['WEBPACK_SERVE'] === 'true';
}