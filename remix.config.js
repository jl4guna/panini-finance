/** @type {import('@remix-run/dev').AppConfig} */
module.exports = {
  serverModuleFormat: "cjs",
  cacheDirectory: "./node_modules/.cache/remix",
  ignoredRouteFiles: ["**/.*", "**/*.test.{js,jsx,ts,tsx}"],
  postcss: true,
  tailwind: true,
};
