import { Navigate, Outlet } from "react-router-dom";
import { toast } from "sonner";
import type { Role } from "@/types/user";
import { decodeJWT, removeJWT } from "@/store/jwt";
import { useCookies } from "react-cookie";
import { CookieTypes } from "@/config/cookie_config";

const ROLE_REDIRECT: Record<Role, string> = {
    ADMIN: "/admin",
    STUDENT: "/student",
    MENTOR: "/mentor",
};

function ProtectedRoutes({ roles }: { roles?: Role[] }) {
    const [cookies] = useCookies(CookieTypes);
    const token = cookies.token;

    if (!roles) {
        if (token) {
            try {
                const role = decodeJWT(token).role as Role;
                return <Navigate to={ROLE_REDIRECT[role]} replace />;
            } catch {
                removeJWT();
            }
        }
        return <Outlet />;
    }

    if (!token) return <Navigate to="/login" replace />;

    let role: Role;
    try {
        role = decodeJWT(token).role as Role;
    } catch {
        removeJWT();
        return <Navigate to="/login" replace />;
    }

    if (!roles.includes(role)) {
        toast.error("You don't have access to this page.");
        return <Navigate to={ROLE_REDIRECT[role]} replace />;
    }

    return <Outlet />;
}

export default ProtectedRoutes;
