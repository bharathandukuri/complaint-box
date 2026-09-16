import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Complaint } from "@/types/complaint";

export default function RecentComplaintsTable({
    recentComplaints,
}: {
    recentComplaints: Complaint[];
}) {
    if (!recentComplaints || recentComplaints.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Recent Complaints</CardTitle>
                </CardHeader>
                <CardContent className="py-6 text-center text-muted-foreground">
                    No recent complaints
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="w-full">
            <h2>Recent Complaints</h2>
            <Table>
                <TableHeader className="bg-primary rounded-t-2xl">
                    <TableRow>
                        <TableHead className="text-primary-foreground font-bold">
                            Title
                        </TableHead>
                        <TableHead className="text-primary-foreground font-bold">
                            Status
                        </TableHead>

                        <TableHead className="text-primary-foreground font-bold">
                            Created At
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="bg-secondary border-border border">
                    {recentComplaints.map((c) => (
                        <TableRow key={c.id}>
                            <TableCell>{c.title}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        c.status === "RESOLVED"
                                            ? "default"
                                            : c.status === "REJECTED"
                                              ? "destructive"
                                              : "outline"
                                    }
                                >
                                    {c.status}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                {new Date(c.createdAt).toLocaleDateString()}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}
