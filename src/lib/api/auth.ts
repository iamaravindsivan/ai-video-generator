import { NextRequest } from "next/server";

export function getUserFromRequest(req: NextRequest) {
  const header = req.headers.get("x-user");
  return header ? JSON.parse(header) : null;
}

export function hasRole(user: any, role: string): boolean {
  return Array.isArray(user?.roles) && user.roles.includes(role);
}
