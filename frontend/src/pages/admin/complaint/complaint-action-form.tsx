import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useTakeComplaintAction } from "@/api/complaint";

interface ComplaintActionFormProps {
    complaint: { id: number; title: string };
    onClose: () => void;
    onActionTaken?: () => void;
}

const actionTypes = ["IN_PROGRESS", "RESOLVED", "REJECTED", "ESCALATED"];

const ComplaintActionSchema = z.object({
    actionType: z.enum(actionTypes as [string, ...string[]], {
        message: "Action type is required",
    }),
    remarks: z
        .string()
        .max(500, "Remarks cannot exceed 500 characters")
        .optional(),
});

type ComplaintActionFormData = z.infer<typeof ComplaintActionSchema>;

export default function ComplaintActionForm({
    complaint,
    onClose,
    onActionTaken,
}: ComplaintActionFormProps) {
    const { mutate: takeAction, isPending } = useTakeComplaintAction();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
    } = useForm<ComplaintActionFormData>({
        resolver: zodResolver(ComplaintActionSchema),
        defaultValues: { actionType: undefined, remarks: "" },
    });

    const watchActionType = watch("actionType");

    const onSubmit = (data: ComplaintActionFormData) => {
        takeAction(
            {
                complaintId: complaint.id,
                action: {
                    actionType: data.actionType,
                    remarks: data.remarks ?? "",
                },
            },
            {
                onSuccess: () => {
                    toast.success("Action taken successfully!");
                    onActionTaken?.();
                    onClose();
                },
                onError: (err) => {
                    toast.error(
                        err?.response?.data?.message ||
                            "Failed to take action. Try again.",
                    );
                },
            },
        );
    };

    return (
        <div className="p-6 rounded-xl shadow-md w-full">
            <h2 className="text-xl font-bold mb-2">
                Take Action on Complaint #{complaint.id}
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
                {complaint.title}
            </p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <Label className="text-sm font-medium mb-1">
                        Action Type
                    </Label>
                    <Select
                        value={watchActionType}
                        onValueChange={(val) => setValue("actionType", val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select action type" />
                        </SelectTrigger>
                        <SelectContent>
                            {actionTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                    {type.replace("_", " ")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.actionType && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.actionType.message}
                        </p>
                    )}
                </div>

                <div>
                    <Label className="text-sm font-medium mb-1">Remarks</Label>
                    <Textarea
                        placeholder="Enter remarks (optional)"
                        {...register("remarks")}
                        rows={4}
                    />
                    {errors.remarks && (
                        <p className="text-red-500 text-sm mt-1">
                            {errors.remarks.message}
                        </p>
                    )}
                </div>

                <div className="flex justify-end gap-2 mt-2">
                    <Button variant="outline" type="button" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
