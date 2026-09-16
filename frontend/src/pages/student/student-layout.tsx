import Layout, { type SidebarLink } from "@/components/layout";
import { ClipboardCheck, Home } from "lucide-react";
import { Route, Routes } from "react-router-dom";
import Complaints from "./complaint/complaints";
import Dashboard from "./dashboard/dashboard";

function StudentLayout() {
    const studentLinks: SidebarLink[] = [
        {
            name: "Dashboard",
            icon: <Home />,
            path: "/student/",
            element: <Dashboard />,
        },
        {
            name: "Complaints",
            icon: <ClipboardCheck />,
            path: "/student/complaints",
            element: <Complaints />,
        },
    ];
    return (
        <Layout name="Student" rootPath="/student" links={studentLinks}>
            <Routes>
                {studentLinks.map((link) => (
                    <Route
                        key={link.path}
                        path={link.path.replace("/student", "") || "/"}
                        element={link.element}
                    />
                ))}
            </Routes>
        </Layout>
    );
}
export default StudentLayout;
