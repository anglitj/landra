import { NextRequest } from "next/server";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

export interface AuthRequest extends NextRequest {
  auth?: {
    user?: {
      id: string;
      name?: string | null;
      email?: string | null;
    };
  } | null;
}
