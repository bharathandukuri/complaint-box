import {
    Mail,
    Phone,
    User2,
    Calendar,
    Hash,
    GraduationCap,
    Layers,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types/user";
import type { LucideIcon } from "lucide-react";

interface StudentCardProps {
    user: User | null;
}

function InfoRow({
    icon: Icon,
    label,
    value,
}: {
    icon: LucideIcon;
    label: string;
    value?: string;
}) {
    if (!value) return null;

    return (
        <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="leading-tight">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-sm font-medium">{value}</p>
            </div>
        </div>
    );
}

function StudentCard({ user }: StudentCardProps) {
    if (!user) return null;

    return (
        <Card className="w-full rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            {/* Header */}
            <CardHeader className="flex flex-col sm:flex-row sm:items-center gap-4 border-b pb-4">
                <Avatar className="h-20 w-20 border shadow-sm">
                    <AvatarImage src={user.profilePic} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                    <CardTitle className="text-xl font-semibold flex items-center gap-2">
                        <User2 className="h-5 w-5 text-primary" />
                        {user.name}
                    </CardTitle>

                    <p className="text-sm text-muted-foreground">
                        @{user.username}
                    </p>

                    <p className="text-xs text-muted-foreground mt-1">
                        Role: {user.role}
                    </p>
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="grid gap-4 sm:grid-cols-2 pt-5">
                <InfoRow icon={Mail} label="Email" value={user.email} />

                <InfoRow icon={Phone} label="Mobile" value={user.mobile} />

                <InfoRow
                    icon={Calendar}
                    label="DOB"
                    value={
                        user.dob
                            ? new Date(user.dob).toLocaleDateString()
                            : undefined
                    }
                />

                <InfoRow icon={Hash} label="Gender" value={user.gender} />

                {user.role === "STUDENT" && user.studentDetails && (
                    <>
                        <InfoRow
                            icon={GraduationCap}
                            label="Roll Number"
                            value={user.studentDetails.rollNumber}
                        />

                        <InfoRow
                            icon={Layers}
                            label="Department"
                            value={user.studentDetails.department}
                        />

                        <InfoRow
                            icon={Layers}
                            label="Section"
                            value={user.studentDetails.section}
                        />

                        <InfoRow
                            icon={Layers}
                            label="Academic Year"
                            value={user.studentDetails.academicYear}
                        />
                    </>
                )}
            </CardContent>
        </Card>
    );
}

export default StudentCard;
