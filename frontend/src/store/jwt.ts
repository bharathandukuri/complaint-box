import type { JwtPayload } from "@/types/jwt-payload";
import { jwtDecode } from "jwt-decode";
import { Cookies } from "react-cookie";

const cookies = new Cookies();

export function getJWT(): string {
    const token = cookies.get("token");

    if (!token) {
        throw new Error("JWT not found");
    }

    return token;
}

export function setJWT(token: string, expiry: Date) {
    cookies.set("token", token, {
        path: "/",
        expires: new Date(expiry),
    });
}

export function decodeJWT(token: string) {
    const payload = jwtDecode<JwtPayload>(token);
    return payload;
}

export function removeJWT() {
    cookies.remove("token", { path: "/" });
}

export function isValidJWT(): boolean {
    try {
        const jwt = getJWT();
        const payload = decodeJWT(jwt);

        if (!payload.exp) return false;

        const nowInSeconds = Math.floor(Date.now() / 1000);
        return payload.exp > nowInSeconds;
    } catch {
        return false;
    }
}
