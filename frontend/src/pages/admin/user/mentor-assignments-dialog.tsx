import { useEffect, useMemo, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Trash2, Plus, AlertTriangle, Layers } from "lucide-react";
import { toast } from "sonner";

import Dialog from "@/components/dialog";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Field,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";

import {
    useAddMentorAssignment,
    useDeleteMentorAssignment,
    useGetMentorAssignedDepartments,
} from "@/api/user";
import { queryClient } from "@/main";
import type { Department } from "@/types/department";
import type { User } from "@/types/user";

const assignmentSchema = z.object({
    departmentCode: z.string().min(1, "Department is required"),
    sectionName: z.string().min(1, "Section is required"),
});

type AssignmentFormValues = z.infer<typeof assignmentSchema>;

interface Props {
    open: boolean;
    setOpen: (v: boolean) => void;
    user: User | null;
    setUser: (user: User | null) => void;
    departments: Department[] | undefined;
}

export default function MentorAssignmentsDialog({
    open,
    setOpen,
    user,
    setUser,
    departments = [],
}: Props) {
    // New state to track which specific item is being deleted
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const { data: assignedRes, isLoading: isLoadingAssignments } =
        useGetMentorAssignedDepartments(user!);

    const currentAssignments = useMemo(
        () => assignedRes?.data ?? [],
        [assignedRes]
    );

    const {
        mutate: addAssignment,
        isPending: isAdding,
        error: addError,
        reset: resetAdd,
    } = useAddMentorAssignment();

    const { mutate: deleteAssignment, isPending: isDeleting } =
        useDeleteMentorAssignment();

    const form = useForm<AssignmentFormValues>({
        resolver: zodResolver(assignmentSchema),
        defaultValues: {
            departmentCode: "",
            sectionName: "",
        },
    });

    const selectedDeptCode = form.watch("departmentCode");

    const availableDepartments = useMemo(() => {
        if (!departments) return [];

        return departments.filter((dept) => {
            const assignedInDept = currentAssignments.find(
                (ad) => ad.code === dept.code
            );

            if (!assignedInDept) return true;

            const allSectionNames = dept.sections.map((s) => s.name);
            return allSectionNames.some(
                (s) => !assignedInDept.sections.includes(s)
            );
        });
    }, [departments, currentAssignments]);

    const availableSections = useMemo(() => {
        if (!selectedDeptCode || !departments) return [];

        const deptObj = departments.find((d) => d.code === selectedDeptCode);
        if (!deptObj) return [];

        const assignedInDept = currentAssignments.find(
            (ad) => ad.code === selectedDeptCode
        );

        if (!assignedInDept) return deptObj.sections;

        return deptObj.sections.filter(
            (section) => !assignedInDept.sections.includes(section.name)
        );
    }, [selectedDeptCode, departments, currentAssignments]);

    useEffect(() => {
        if (!open) {
            form.reset();
            resetAdd();
            setUser(null);
        }
    }, [open, form, resetAdd, setUser]);

    const handleAdd = (data: AssignmentFormValues) => {
        if (!user) return;
        addAssignment(
            {
                department: data.departmentCode,
                section: data.sectionName,
                user: user,
            },
            {
                onSuccess: () => {
                    toast.success("Assignment added successfully");
                    queryClient.invalidateQueries({
                        queryKey: ["assigned-departments", user.username],
                    });
                    // Refresh users list if needed
                    queryClient.invalidateQueries({ queryKey: ["users"] });
                    form.setValue("sectionName", "");
                },
                onError: () => toast.error("Failed to add assignment"),
            }
        );
    };

    const handleDelete = (deptCode: string, sectionName: string) => {
        if (!user) return;

        // Track the specific ID
        const uniqueId = `${deptCode}-${sectionName}`;
        setDeletingId(uniqueId);

        deleteAssignment(
            {
                department: deptCode,
                section: sectionName,
                user: user,
            },
            {
                onSuccess: () => {
                    toast.success("Assignment removed");
                    queryClient.invalidateQueries({
                        queryKey: ["assigned-departments", user.username],
                    });
                    queryClient.invalidateQueries({ queryKey: ["users"] });
                    setDeletingId(null);
                },
                onError: () => {
                    toast.error("Failed to remove assignment");
                    setDeletingId(null);
                },
            }
        );
    };

    const getDeptName = (code: string) => {
        return departments.find((d) => d.code === code)?.name || code;
    };

    if (!user) {
        return (
            <Dialog
                open={open}
                onOpenChange={setOpen}
                header="No mentor selected"
                body={
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>Missing Mentor</AlertTitle>
                        <AlertDescription>
                            Please select a mentor before managing assignments.
                        </AlertDescription>
                    </Alert>
                }
            />
        );
    }

    if (isLoadingAssignments) {
        return (
            <Dialog
                open={open}
                onOpenChange={setOpen}
                header={`Manage Assignments: ${user.name}`}
                body={
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-5 h-5 animate-spin" />
                    </div>
                }
            />
        );
    }

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
            header={`Manage Assignments: ${user.name}`}
            className="sm:max-w-xl"
            body={
                <div className="flex flex-col gap-6">
                    <form onSubmit={form.handleSubmit(handleAdd)}>
                        <FieldSet>
                            <FieldGroup>
                                <div className="grid grid-cols-2 gap-3">
                                    <Controller
                                        control={form.control}
                                        name="departmentCode"
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    !!fieldState.error
                                                }
                                                className="w-full"
                                            >
                                                <FieldLabel>Dept</FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={(val) => {
                                                        field.onChange(val);
                                                        form.setValue(
                                                            "sectionName",
                                                            ""
                                                        );
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableDepartments.map(
                                                            (d) => (
                                                                <SelectItem
                                                                    key={d.code}
                                                                    value={
                                                                        d.code
                                                                    }
                                                                >
                                                                    {d.code}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        )}
                                    />

                                    <Controller
                                        control={form.control}
                                        name="sectionName"
                                        render={({ field, fieldState }) => (
                                            <Field
                                                data-invalid={
                                                    !!fieldState.error
                                                }
                                                className="w-full"
                                            >
                                                <FieldLabel>Section</FieldLabel>
                                                <Select
                                                    value={field.value}
                                                    onValueChange={
                                                        field.onChange
                                                    }
                                                    disabled={
                                                        !selectedDeptCode ||
                                                        availableSections.length ===
                                                            0
                                                    }
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {availableSections.map(
                                                            (s) => (
                                                                <SelectItem
                                                                    key={s.name}
                                                                    value={
                                                                        s.name
                                                                    }
                                                                >
                                                                    {s.name}
                                                                </SelectItem>
                                                            )
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </Field>
                                        )}
                                    />
                                </div>
                            </FieldGroup>

                            {addError && (
                                <Alert variant="destructive" className="mt-3">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                        {addError?.response?.data?.message ||
                                            addError.message}
                                    </AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                className="w-full mt-4"
                                disabled={
                                    isAdding ||
                                    !selectedDeptCode ||
                                    availableSections.length === 0
                                }
                            >
                                {isAdding ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Plus className="w-4 h-4 mr-2" />
                                )}
                                Add Assignment
                            </Button>
                        </FieldSet>
                    </form>

                    <FieldSeparator />

                    <div className="flex flex-col gap-2">
                        <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
                            <Layers className="w-4 h-4" />
                            Current Assignments
                        </h3>

                        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-1">
                            {currentAssignments.length === 0 ? (
                                <div className="text-center py-6 border rounded-lg border-dashed bg-muted/20">
                                    <p className="text-sm text-muted-foreground">
                                        No active assignments.
                                    </p>
                                </div>
                            ) : (
                                currentAssignments.flatMap((dept) =>
                                    dept.sections.map((sectionName) => {
                                        const uniqueId = `${dept.code}-${sectionName}`;
                                        // Check if this specific item is deleting
                                        const isItemDeleting =
                                            isDeleting &&
                                            deletingId === uniqueId;

                                        return (
                                            <div
                                                key={uniqueId}
                                                className="flex items-center justify-between p-3 rounded-lg border bg-background hover:bg-muted/30 transition-colors"
                                            >
                                                <div className="flex flex-col gap-0.5">
                                                    <span className="text-sm font-semibold text-foreground">
                                                        Section {sectionName}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {getDeptName(dept.code)}{" "}
                                                        ({dept.code})
                                                    </span>
                                                </div>

                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                    disabled={isDeleting} // Disable all while any deletion is happening
                                                    onClick={() =>
                                                        handleDelete(
                                                            dept.code,
                                                            sectionName
                                                        )
                                                    }
                                                >
                                                    {isItemDeleting ? (
                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        );
                                    })
                                )
                            )}
                        </div>
                    </div>
                </div>
            }
        />
    );
}
