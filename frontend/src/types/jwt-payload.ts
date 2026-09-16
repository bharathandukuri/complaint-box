import { type JwtPayload as JWT } from "jwt-decode";

export interface JwtPayload extends JWT {
    role?: "ADMIN" | "MENTOR" | "STUDENT";
}
