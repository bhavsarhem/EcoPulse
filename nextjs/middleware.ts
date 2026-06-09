export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/api/scan", "/api/report", "/api/history"],
};
