import { Loader2 } from "lucide-react";
import MentorCard from "./mentor-card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { useGetUserData } from "@/api/user";

function Dashboard() {
    const { data, isLoading, error } = useGetUserData();

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-muted-foreground p-6">
                <Loader2 className="animate-spin h-4 w-4" /> Loading...
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="text-red-500 p-6">Failed to load mentor data</div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-muted/30 p-4 sm:p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold">Mentor Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Profile and assigned responsibilities
                </p>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-stretch">
                {/* Mentor Card */}
                <div className="xl:col-span-1">
                    <MentorCard mentor={data} />
                </div>

                {/* Table (UNCHANGED) */}
                <div className="xl:col-span-2">
                    <Card className="w-full py-0 h-full">
                        {/* table code stays EXACTLY as you wrote it */}
                        {/* 👇 untouched */}
                        <Table>
                            <TableHeader className="bg-primary rounded-t-2xl">
                                <TableRow>
                                    <TableHead className="text-primary-foreground font-bold font-poppins">
                                        Department
                                    </TableHead>
                                    <TableHead className="text-primary-foreground font-bold font-poppins">
                                        Section
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.mentorDetails?.assignedDepartments
                                    ?.length ? (
                                    data.mentorDetails.assignedDepartments.map(
                                        (dept) =>
                                            dept.sections.length ? (
                                                dept.sections.map((sec) => (
                                                    <TableRow
                                                        key={dept.code + sec}
                                                    >
                                                        <TableCell>
                                                            {dept.code}
                                                        </TableCell>
                                                        <TableCell>
                                                            {sec}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow key={dept.code}>
                                                    <TableCell>
                                                        {dept.code}
                                                    </TableCell>
                                                    <TableCell>
                                                        No sections assigned
                                                    </TableCell>
                                                </TableRow>
                                            ),
                                    )
                                ) : (
                                    <TableRow>
                                        <TableCell
                                            colSpan={2}
                                            className="text-center text-muted-foreground py-6"
                                        >
                                            No assigned departments or sections
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </Card>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
