import Layout, { type SidebarLink } from "@/components/layout";
import { ClipboardCheck, Home } from "lucide-react";
import { Route, Routes } from "react-router-dom";
import MentorDashboard from "./dashboard/dashboard";
import ComplaintsPage from "@/pages/admin/complaint/complaints";

function MentorLayout() {
  const studentLinks: SidebarLink[] = [
    {
      name: "Dashboard",
      icon: <Home />,
      path: "/mentor/",
      element: <MentorDashboard />,
    },
    {
      name: "Complaints",
      icon: <ClipboardCheck />,
      path: "/mentor/complaints",
      element: <ComplaintsPage />,
    },
  ];
  return (
    <Layout name="Mentor" rootPath="/mentor" links={studentLinks}>
      <Routes>
        {studentLinks.map((link) => (
          <Route
            key={link.path}
            path={link.path.replace("/mentor", "") || "/"}
            element={link.element}
          />
        ))}
      </Routes>
    </Layout>
  );
}
export default MentorLayout;
