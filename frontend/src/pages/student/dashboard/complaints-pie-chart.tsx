import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { ComplaintDetails } from "@/types/user";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Label,
} from "recharts";

interface ComplaintsPieChartProps {
    complaintDetails: ComplaintDetails;
}

function ComplaintsPieChart({ complaintDetails }: ComplaintsPieChartProps) {
    const chartData = [
        { name: "Pending", value: complaintDetails?.totalPending ?? 0 },
        { name: "In Progress", value: complaintDetails?.totalInProgress ?? 0 },
        { name: "Resolved", value: complaintDetails?.totalResolved ?? 0 },
        { name: "Rejected", value: complaintDetails?.totalRejected ?? 0 },
        { name: "Escalated", value: complaintDetails?.totalEscalated ?? 0 },
    ];

    const total = chartData.reduce((acc, cur) => acc + cur.value, 0);
    const COLORS = ["#FACC15", "#3B82F6", "#22C55E", "#EF4444", "#A855F7"];

    return (
        <Card className="h-full rounded-2xl shadow-md">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">
                    Complaints Overview
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                    Status distribution
                </p>
            </CardHeader>

            <CardContent className="flex-1">
                {total === 0 ? (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                        No complaints to display
                    </div>
                ) : (
                    <div className="w-full h-[320px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius="40%"
                                    outerRadius="70%"
                                    paddingAngle={2}
                                >
                                    {chartData.map((_, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                    <Label
                                        value={`${total} Complaints`}
                                        position="center"
                                        className="fill-foreground text-xl md:text-2xl font-bold"
                                    />
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default ComplaintsPieChart;
