import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle, Loader2, Plus, Trash2 } from "lucide-react";
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

import { useAddDepartment } from "@/api/department";
import { queryClient } from "@/main";
import type { Department } from "@/types/department";

const sectionSchema = z.object({
    name: z.string().min(1, "Section name required"),
});

const departmentSchema = z.object({
    code: z.string().min(1, "Code is required"),
    name: z.string().min(1, "Name is required"),
    sections: z.array(sectionSchema).min(1, "At least one section is required"),
});

export type DepartmentForm = z.infer<typeof departmentSchema>;

function AddDepartmentDialog({ department }: { department?: Department }) {
    const [open, setOpen] = useState(false);

    const form = useForm<DepartmentForm>({
        defaultValues: department ?? {
            code: "",
            name: "",
            sections: [{ name: "" }],
        },
        mode: "onBlur",
        resolver: zodResolver(departmentSchema),
    });

    const { fields, append, remove } = useFieldArray({
        name: "sections",
        control: form.control,
    });

    const {
        mutate: addDepartment,
        isPending: isAdding,
        error: addDepartmentError,
        reset: resetMutation,
    } = useAddDepartment();

    const onSubmit = (payload: DepartmentForm) => {
        addDepartment(payload, {
            onSuccess: () => {
                toast.success("Department added successfully");
                queryClient.invalidateQueries({ queryKey: ["departments"] });
                setOpen(false);
            },
            onError: () => {
                toast.error("Failed to add department");
            },
        });
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (!newOpen) {
            form.reset();
            resetMutation();
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={handleOpenChange}
            className="max-w-md max-h-[90vh] overflow-y-auto"
            header="Add New Department"
            trigger={
                <Button className="flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Add Department
                </Button>
            }
            body={
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldSet>
                        <FieldGroup>
                            <Controller
                                control={form.control}
                                name="code"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={!!fieldState.error}>
                                        <FieldLabel>Department Code</FieldLabel>
                                        <Input
                                            {...field}
                                            aria-invalid={!!fieldState.error}
                                        />
                                        <FieldError>
                                            {fieldState.error?.message}
                                        </FieldError>
                                    </Field>
                                )}
                            />
                            <Controller
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={!!fieldState.error}>
                                        <FieldLabel>Department Name</FieldLabel>
                                        <Input
                                            {...field}
                                            aria-invalid={!!fieldState.error}
                                        />
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
                                <div className="space-y-1">
                                    <h3 className="text-sm font-medium">
                                        Sections
                                    </h3>
                                    {form.formState.errors.sections?.root && (
                                        <p className="text-xs text-destructive">
                                            {
                                                form.formState.errors.sections
                                                    .root.message
                                            }
                                        </p>
                                    )}
                                </div>
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

                            {fields.map((field, index) => (
                                <div
                                    key={field.id}
                                    className="flex items-start gap-2"
                                >
                                    <Controller
                                        control={form.control}
                                        name={`sections.${index}.name`}
                                        render={({ field, fieldState }) => (
                                            <Field
                                                className="flex-1"
                                                data-invalid={
                                                    !!fieldState.error
                                                }
                                            >
                                                <FieldLabel
                                                    className={
                                                        index !== 0
                                                            ? "sr-only"
                                                            : ""
                                                    }
                                                >
                                                    Section Name
                                                </FieldLabel>
                                                <Input
                                                    {...field}
                                                    placeholder="Section name"
                                                    aria-invalid={
                                                        !!fieldState.error
                                                    }
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
                                        className={`text-destructive ${
                                            index === 0 ? "mt-8" : "mt-0"
                                        }`}
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </FieldGroup>
                        {addDepartmentError && (
                            <Alert variant="destructive">
                                <AlertTitle className="flex gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Failed to add
                                </AlertTitle>
                                <AlertDescription>
                                    {addDepartmentError?.response?.data
                                        .message ?? addDepartmentError?.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isAdding}
                        >
                            {isAdding ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                "Save Department"
                            )}
                        </Button>
                    </FieldSet>
                </form>
            }
        />
    );
}

export default AddDepartmentDialog;
