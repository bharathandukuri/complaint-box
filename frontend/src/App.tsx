import AdminLayout from "@/pages/admin/admin-layout";
import { Route, Routes } from "react-router-dom";
import LoginPage from "./pages/login";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoutes from "./components/protected-routes";
import StudentLayout from "@/pages/student/student-layout";
import MentorLayout from "./pages/mentor/mentor-layout";

function App() {
    return (
        <div className="h-screen w-screen">
            <Toaster />
            <Routes>
                <Route element={<ProtectedRoutes />}>
                    <Route path="/*" element={<LoginPage />} />
                </Route>

                <Route element={<ProtectedRoutes roles={["ADMIN"]} />}>
                    <Route path="/admin/*" element={<AdminLayout />} />
                </Route>

                <Route element={<ProtectedRoutes roles={["STUDENT"]} />}>
                    <Route path="/student/*" element={<StudentLayout />} />
                </Route>

                <Route element={<ProtectedRoutes roles={["MENTOR"]} />}>
                    <Route path="/mentor/*" element={<MentorLayout />} />
                </Route>
            </Routes>
        </div>
    );
}

export default App;
