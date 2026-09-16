import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
    FieldSet,
} from "@/components/ui/field";
import Dialog from "@/components/dialog";

import { useUpdateDepartment } from "@/api/department";
import { queryClient } from "@/main";
import type { Department } from "@/types/department";

const sectionSchema = z.object({
    name: z.string().min(1, "Section name required"),
});

const departmentSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1, "Name is required"),
    sections: z.array(sectionSchema).min(1, "At least one section is required"),
});

export type EditDepartmentForm = z.infer<typeof departmentSchema>;

interface Props {
    department: Department | null;
    setDepartment: (department: Department | null) => void;
    open: boolean;
    setOpen: (v: boolean) => void;
}

function EditDepartmentDialog({
    department,
    setDepartment,
    open,
    setOpen,
}: Props) {
    const form = useForm<EditDepartmentForm>({
        resolver: zodResolver(departmentSchema),
        mode: "onBlur",
        defaultValues: department || undefined,
    });

    const { fields, append, remove } = useFieldArray({
        name: "sections",
        control: form.control,
    });

    const {
        mutate: updateDepartment,
        isPending,
        error,
        reset: resetMutation,
    } = useUpdateDepartment();

    useEffect(() => {
        if (department) form.reset(department);
    }, [department, form]);

    const onSubmit = (payload: EditDepartmentForm) => {
        if (!department) return;

        updateDepartment(
            { oldDepartment: department, newDepartment: payload },
            {
                onSuccess: () => {
                    toast.success("Department updated");
                    queryClient.invalidateQueries({
                        queryKey: ["departments"],
                    });
                    setOpen(false);
                    setDepartment(null);
                },
                onError: () => toast.error("Failed to update department"),
            }
        );
    };

    const handleOpenChange = (v: boolean) => {
        setOpen(v);
        if (!v) {
            setDepartment(null);
            form.reset();
            resetMutation();
        }
    };

    if (!department) return null;

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
            header="Edit Department"
            className="max-w-md max-h-[90vh] overflow-y-auto"
            body={
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldSet>
                        <FieldGroup>
                            <Controller
                                control={form.control}
                                name="code"
                                render={({ field }) => (
                                    <Field>
                                        <FieldLabel>Department Code</FieldLabel>
                                        <Input {...field} />
                                    </Field>
                                )}
                            />

                            <Controller
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={!!fieldState.error}>
                                        <FieldLabel>Department Name</FieldLabel>
                                        <Input {...field} />
                                        <FieldError>
                                            {fieldState.error?.message}
                                        </FieldError>
                                    </Field>
                                )}
                            />
                        </FieldGroup>

                        <FieldSeparator />

                        <FieldGroup>
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-medium">
                                    Sections
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ name: "" })}
                                >
                                    <Plus className="w-3 h-3 mr-1" /> Add
                                    Section
                                </Button>
                            </div>

                            {fields.map((f, i) => (
                                <div
                                    key={f.id}
                                    className="flex items-start gap-2"
                                >
                                    <Controller
                                        control={form.control}
                                        name={`sections.${i}.name`}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                className="flex-1"
                                                data-invalid={
                                                    !!fieldState.error
                                                }
                                            >
                                                <Input
                                                    {...field}
                                                    placeholder="Section name"
                                                />
                                                <FieldError>
                                                    {fieldState.error?.message}
                                                </FieldError>
                                            </Field>
                                        )}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-destructive mt-2"
                                        disabled={fields.length === 1}
                                        onClick={() => remove(i)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </FieldGroup>

                        {error && (
                            <Alert variant="destructive">
                                <AlertTitle className="flex gap-2">
                                    <AlertTriangle className="w-4 h-4" /> Update
                                    failed
                                </AlertTitle>
                                <AlertDescription>
                                    {error?.response?.data.message ??
                                        error.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Update Department"
                            )}
                        </Button>
                    </FieldSet>
                </form>
            }
        />
    );
}

export default EditDepartmentDialog;
