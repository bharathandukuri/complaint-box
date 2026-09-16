import ComplaintsPieChart from "./complaints-pie-chart";
import StudentCard from "./student-card";
import { Loader2 } from "lucide-react";
import RecentComplaintsTable from "./recent-complaints";
import { useGetUserData } from "@/api/user";

function StudentDashboard() {
    const { data, isLoading, error } = useGetUserData();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground p-6">
                <Loader2 className="animate-spin h-4 w-4" /> Loading...
            </div>
        );
    }

    if (error || !data) {
        return <div className="text-red-500 p-6">Failed to load user data</div>;
    }

    return (
        <div className="min-h-screen w-full p-4 sm:p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-semibold">Student Dashboard</h1>
                <p className="text-muted-foreground text-sm">
                    Overview of your profile and complaints
                </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <StudentCard user={data} />

                <ComplaintsPieChart
                    complaintDetails={
                        data.complaintDetails ?? {
                            totalComplaints: 0,
                            totalPending: 0,
                            totalInProgress: 0,
                            totalResolved: 0,
                            totalRejected: 0,
                            totalEscalated: 0,
                            recentComplaints: [],
                        }
                    }
                />
            </div>

            <div className="bg-muted rounded-2xl shadow-sm p-4">
                <RecentComplaintsTable
                    recentComplaints={
                        data.complaintDetails?.recentComplaints ?? []
                    }
                />
            </div>
        </div>
    );
}

export default StudentDashboard;
