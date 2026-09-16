import { ALargeSmall, BookA, Home, MailOpen, UserCircle } from "lucide-react";
import { Routes, Route } from "react-router-dom";
import type { SidebarLink } from "@/components/layout";
import Layout from "@/components/layout";
import User from "./user/users";
import Departments from "./department/departments";
import ComplaintsPage from "./complaint/complaints";
import ComplaintTypes from "./complaint-type/complaint-types";

function AdminLayout() {
    const adminLinks: SidebarLink[] = [
        {
            name: "Dashboard",
            icon: <Home className="w-4 h-4" />,
            path: "/admin/",
            element: <div>Dashboard</div>,
        },
        {
            name: "Department",
            icon: <BookA className="w-4 h-4" />,
            path: "/admin/department",
            element: <Departments />,
        },
        {
            name: "Users",
            icon: <UserCircle className="w-4 h-4" />,
            path: "/admin/user",
            element: <User />,
        },
        {
            name: "Complaint Types",
            icon: <ALargeSmall className="w-4 h-4" />,
            path: "/admin/complaint-type",
            element: <ComplaintTypes />,
        },
        {
            name: "Complaints",
            icon: <MailOpen className="w-4 h-4" />,
            path: "/admin/complaint",
            element: <ComplaintsPage />,
        },
    ];

    return (
        <Layout
            name="Admin"
            rootPath="/admin"
            links={adminLinks}
            footer={
                <span>
                    © {new Date().getFullYear()} Complaint Box. All rights
                    reserved.
                </span>
            }
        >
            <Routes>
                {adminLinks.map((link) => (
                    <Route
                        key={link.path}
                        path={link.path.replace("/admin", "") || "/"}
                        element={link.element}
                    />
                ))}
            </Routes>
        </Layout>
    );
}

export default AdminLayout;
