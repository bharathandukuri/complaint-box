import {
    Mail,
    Phone,
    Calendar,
    User2,
    Briefcase,
    Hash,
    type LucideIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { User } from "@/types/user";

interface MentorCardProps {
    mentor: User;
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

function MentorCard({ mentor }: MentorCardProps) {
    if (!mentor) return null;

    return (
        <Card className="w-full h-full rounded-2xl shadow-md hover:shadow-lg transition-shadow">
            {/* Header */}
            <CardHeader className="flex flex-col items-center gap-3 border-b pb-4 text-center">
                <Avatar className="h-20 w-20 border shadow-sm">
                    <AvatarImage src={mentor.profilePic} alt={mentor.name} />
                    <AvatarFallback>{mentor.name?.charAt(0)}</AvatarFallback>
                </Avatar>

                <div>
                    <CardTitle className="text-xl font-semibold flex items-center justify-center gap-2">
                        <User2 className="h-5 w-5 text-primary" />
                        {mentor.name}
                    </CardTitle>

                    <p className="text-sm text-muted-foreground">
                        @{mentor.username}
                    </p>

                    {mentor.mentorDetails?.designation && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center justify-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {mentor.mentorDetails.designation}
                        </p>
                    )}
                </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="grid gap-4 pt-5">
                <InfoRow icon={Mail} label="Email" value={mentor.email} />

                <InfoRow icon={Phone} label="Mobile" value={mentor.mobile} />

                <InfoRow
                    icon={Calendar}
                    label="DOB"
                    value={
                        mentor.dob
                            ? new Date(mentor.dob).toLocaleDateString()
                            : undefined
                    }
                />

                <InfoRow icon={Hash} label="Gender" value={mentor.gender} />
            </CardContent>
        </Card>
    );
}

export default MentorCard;
