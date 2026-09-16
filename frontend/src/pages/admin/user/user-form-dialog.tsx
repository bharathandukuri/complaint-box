import { useState, useEffect, useMemo } from "react";
import {
    Controller,
    useForm,
    type Control,
    type ControllerRenderProps,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Camera,
    Eye,
    EyeOff,
    Loader2,
    UserIcon,
    CalendarIcon,
    AlertTriangle,
    Plus,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSet,
} from "@/components/ui/field";
import Dialog from "@/components/dialog";
import {
    InputGroup,
    InputGroupButton,
    InputGroupInput,
} from "@/components/ui/input-group";
import { useUploadFile } from "@/api/file";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import type { Department } from "@/types/department";
import { useAddUser, useUpdateUser } from "@/api/user";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { queryClient } from "@/main";
import type { User } from "@/types/user";

function formatDate(date: Date | undefined) {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    });
}

function isValidDate(date: Date | undefined) {
    if (!date) return false;
    return !isNaN(date.getTime());
}

const commonFields = {
    username: z
        .string()
        .min(1, "Username is required")
        .max(20, "Max 20 chars")
        .regex(/^[a-zA-Z][a-zA-Z0-9_]+$/, "Invalid format"),
    name: z.string().min(1, "Name is required").max(50, "Max 50 chars"),
    email: z.email("Invalid email"),
    dob: z
        .date({ error: "Date of birth is required" })
        .refine(
            (date) => date <= new Date(),
            "Date of birth cannot be in the future"
        ),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]),
    mobile: z.string().optional(),
    profilePic: z.string().optional(),
    banned: z.boolean().optional(),
};

const studentDetailsSchema = z.object({
    rollNumber: z
        .string({ error: "Roll number is required" })
        .min(1, "Roll number required"),
    department: z
        .string({ error: "Department required" })
        .min(1, "Department required"),
    section: z.string({ error: "Section required" }).min(1, "Section required"),
    academicYear: z.string().regex(/^\d{4}-\d{4}$/, "Format: YYYY-YYYY"),
});

const mentorDetailsSchema = z.object({
    employeeID: z.string().min(1, "Employee ID required"),
    designation: z.string().min(1, "Designation required"),
    department: z.string().min(1, "Department required"),
});

const getUserSchema = (type: "add" | "edit") => {
    let passwordSchema;

    if (type === "add") {
        passwordSchema = z
            .string()
            .min(8, "Min 8 chars")
            .max(50, "Max 50 chars");
    } else {
        passwordSchema = z
            .string()
            .min(8, "Min 8 chars")
            .max(50, "Max 50 chars")
            .optional()
            .or(z.literal(""));
    }

    const baseSchema = z.object({
        ...commonFields,
        password: passwordSchema,
    });

    return z.discriminatedUnion("role", [
        baseSchema.extend({
            role: z.literal("ADMIN"),
        }),
        baseSchema.extend({
            role: z.literal("STUDENT"),
            studentDetails: studentDetailsSchema,
        }),
        baseSchema.extend({
            role: z.literal("MENTOR"),
            mentorDetails: mentorDetailsSchema,
        }),
    ]);
};

type UserForm = z.infer<ReturnType<typeof getUserSchema>>;

export default function UserDialog({
    departments,
    type,
    user,
    setUser,
    openDialog,
    setOpenDialog,
}: {
    departments: Department[];
    type: "add" | "edit";
    user?: User | null;
    setUser?: (user: User | null) => void;
    openDialog?: boolean;
    setOpenDialog?: (open: boolean) => void;
}) {
    const [open, setOpen] = useState(false);

    const formSchema = useMemo(() => getUserSchema(type), [type]);

    const form = useForm<UserForm>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            name: "",
            email: "",
            password: "",
            role: "ADMIN",
            gender: "MALE",
            dob: new Date(),
        },
    });

    useEffect(() => {
        if (type === "edit" && user) {
            const baseUser = {
                username: user.username ?? "",
                name: user.name ?? "",
                email: user.email ?? "",
                password: "",
                gender: user.gender ?? "MALE",
                dob: user.dob ? new Date(user.dob) : new Date(),
                mobile: user.mobile ?? undefined,
                profilePic: user.profilePic ?? "",
                banned: user.banned ?? false,
            };

            if (user.role === "STUDENT" && user.studentDetails) {
                form.reset({
                    ...baseUser,
                    role: "STUDENT",
                    studentDetails: {
                        rollNumber: user.studentDetails.rollNumber,
                        department: user.studentDetails.department,
                        section: user.studentDetails.section,
                        academicYear: user.studentDetails.academicYear,
                    },
                });
            } else if (user.role === "MENTOR" && user.mentorDetails) {
                form.reset({
                    ...baseUser,
                    role: "MENTOR",
                    mentorDetails: {
                        employeeID: user.mentorDetails.employeeID,
                        designation: user.mentorDetails.designation,
                        department: user.mentorDetails.department,
                    },
                });
            } else {
                form.reset({
                    ...baseUser,
                    role: "ADMIN",
                });
            }
        } else if (type === "add") {
            form.reset({
                username: "",
                name: "",
                email: "",
                password: "",
                role: "ADMIN",
                gender: "MALE",
                dob: new Date(),
            });
        }
    }, [user, type, form]);

    const role = form.watch("role");

    const {
        mutate: uploadFile,
        isPending: isFileUploading,
        error: fileUploadError,
    } = useUploadFile();

    const {
        mutate: addUser,
        isPending: isAddingUser,
        error: addUserError,
    } = useAddUser();

    const {
        mutate: updateUser,
        isPending: isUpdatingUser,
        error: updateUserError,
    } = useUpdateUser();

    const onSubmit = (payload: UserForm) => {
        if (!isFileUploading && !isAddingUser && !isUpdatingUser) {
            const finalPayload = { ...payload };
            if (type === "edit" && finalPayload.password === "") {
                delete finalPayload.password;
            }

            if (type === "add") {
                //@ts-expect-error("error at final payload of the user dialog submission in the add section")
                addUser(finalPayload, {
                    onSuccess: () => {
                        queryClient.invalidateQueries({ queryKey: ["users"] });
                        toast.success("User added successfully");
                        setOpen(false);
                        form.reset();
                    },
                    onError: () => {
                        toast.error("Failed to add User");
                    },
                });
            } else {
                if (!user) {
                    toast.error("Internal error");
                    throw new Error("Internal error");
                }

                updateUser(
                    //@ts-expect-error("error at final payload of the user dialog submission in the edit section")
                    {
                        id: user?.id,
                        ...finalPayload,
                    },
                    {
                        onSuccess: () => {
                            queryClient.invalidateQueries({
                                queryKey: ["users"],
                            });
                            toast.success("User updated successfully");
                            if (setUser) {
                                setUser(null);
                            }
                            if (setOpenDialog) {
                                setOpenDialog(false);
                            }
                            form.reset();
                        },
                        onError: () => {
                            toast.error("Failed to update User");
                        },
                    }
                );
            }
        }
    };

    const handleOpenChange = (v: boolean) => {
        if (setOpenDialog) {
            setOpenDialog(v);
        }
        if (!v) {
            if (setUser) {
                setUser(null);
            }
            form.reset();
        }
    };

    const selectedDept = form.watch("studentDetails.department");

    return (
        <Dialog
            open={type === "add" ? open : openDialog}
            onOpenChange={type === "add" ? setOpen : handleOpenChange}
            header={type === "add" ? "Add New User" : "Edit User"}
            className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
            trigger={
                type === "add" ? (
                    <Button className="flex gap-2">
                        <Plus className="w-4 h-4" /> Add User
                    </Button>
                ) : null
            }
            body={
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <FieldSet>
                        <div className="flex w-full items-center justify-center">
                            <Controller
                                control={form.control}
                                name="profilePic"
                                render={({ field, fieldState }) => (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="relative w-24 h-24 flex items-center justify-center">
                                            {field.value ? (
                                                <img
                                                    src={field.value}
                                                    alt="Profile"
                                                    className="w-full h-full rounded-full object-cover border shadow-sm"
                                                />
                                            ) : (
                                                <div className="w-full h-full rounded-full border flex items-center justify-center bg-muted text-muted-foreground">
                                                    <UserIcon className="w-10 h-10" />
                                                </div>
                                            )}
                                            <label className="absolute -bottom-1 -right-1 bg-background p-2 rounded-full cursor-pointer border shadow-sm hover:bg-muted transition-colors z-10">
                                                <Camera className="w-4 h-4" />
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    disabled={isFileUploading}
                                                    onChange={(e) => {
                                                        const file =
                                                            e.target.files?.[0];
                                                        if (file) {
                                                            uploadFile(file, {
                                                                onSuccess: (
                                                                    url
                                                                ) =>
                                                                    form.setValue(
                                                                        "profilePic",
                                                                        url,
                                                                        {
                                                                            shouldValidate:
                                                                                true,
                                                                        }
                                                                    ),
                                                                onError: () =>
                                                                    toast.error(
                                                                        "Upload failed"
                                                                    ),
                                                            });
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        {isFileUploading && (
                                            <span className="text-xs text-blue-600 animate-pulse">
                                                Uploading...
                                            </span>
                                        )}
                                        {fieldState.error && (
                                            <span className="text-xs text-red-500">
                                                {fieldState.error.message}
                                            </span>
                                        )}
                                        {fileUploadError && (
                                            <span className="text-xs text-red-500">
                                                Upload failed
                                            </span>
                                        )}
                                    </div>
                                )}
                            />
                        </div>

                        <FieldGroup>
                            <FormInput
                                control={form.control}
                                name="username"
                                label="Username"
                            />
                            <FormInput
                                control={form.control}
                                name="name"
                                label="Full Name"
                            />
                            <FormInput
                                control={form.control}
                                name="email"
                                label="Email"
                                type="email"
                            />
                            <FormInput
                                control={form.control}
                                name="password"
                                label={
                                    type === "add"
                                        ? "Password"
                                        : "Password (leave empty to keep current)"
                                }
                                type="password"
                            />
                        </FieldGroup>

                        <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormSelect
                                control={form.control}
                                name="role"
                                label="Role"
                                options={["ADMIN", "MENTOR", "STUDENT"]}
                            />
                            <FormSelect
                                control={form.control}
                                name="gender"
                                label="Gender"
                                options={["MALE", "FEMALE", "OTHER"]}
                            />
                            <div className="col-span-1 md:col-span-2">
                                <FormDatePicker
                                    control={form.control}
                                    name="dob"
                                    label="Date of Birth"
                                />
                            </div>
                        </FieldGroup>

                        {role === "STUDENT" && (
                            <div className="animate-in fade-in slide-in-from-top-2 space-y-4 rounded-lg border p-4 bg-muted/30">
                                <h3 className="font-semibold text-sm text-foreground">
                                    Student Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput
                                        control={form.control}
                                        name="studentDetails.rollNumber"
                                        label="Roll Number"
                                    />
                                    <FormInput
                                        control={form.control}
                                        name="studentDetails.academicYear"
                                        label="Academic Year"
                                        placeholder="2024-2025"
                                    />
                                </div>

                                <FormSelect
                                    control={form.control}
                                    name="studentDetails.department"
                                    label="Department"
                                    options={departments.map((d) => ({
                                        label: d.name,
                                        value: d.code,
                                    }))}
                                />
                                <FormSelect
                                    control={form.control}
                                    name="studentDetails.section"
                                    label="Section"
                                    options={
                                        departments
                                            .find(
                                                (d) => d.code === selectedDept
                                            )
                                            ?.sections.map((d) => ({
                                                label: d.name,
                                                value: d.name,
                                            })) ?? []
                                    }
                                />
                            </div>
                        )}

                        {role === "MENTOR" && (
                            <div className="animate-in fade-in slide-in-from-top-2 space-y-4 rounded-lg border p-4 bg-muted/30">
                                <h3 className="font-semibold text-sm text-foreground">
                                    Mentor Details
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput
                                        control={form.control}
                                        name="mentorDetails.employeeID"
                                        label="Employee ID"
                                    />
                                    <FormInput
                                        control={form.control}
                                        name="mentorDetails.designation"
                                        label="Designation"
                                    />
                                </div>
                                <FormSelect
                                    control={form.control}
                                    name="mentorDetails.department"
                                    label="Department"
                                    options={departments.map((d) => ({
                                        label: d.name,
                                        value: d.code,
                                    }))}
                                />
                            </div>
                        )}
                        {(addUserError || updateUserError) && (
                            <Alert
                                variant={"destructive"}
                                className="flex items-center justify-center flex-col"
                            >
                                <AlertTitle className="flex flex-row gap-2 items-center justify-center">
                                    <AlertTriangle />
                                    Failed to{" "}
                                    {type === "add" ? "add" : "update"} User
                                </AlertTitle>
                                <AlertDescription>
                                    {type === "add"
                                        ? addUserError?.response?.data
                                              .message ?? addUserError?.message
                                        : updateUserError?.response?.data
                                              .message ??
                                          updateUserError?.message}
                                </AlertDescription>
                            </Alert>
                        )}

                        <Button
                            className="w-full"
                            disabled={isFileUploading && isAddingUser}
                            type="submit"
                        >
                            {isFileUploading &&
                            (isAddingUser || isUpdatingUser) ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <div>Save User</div>
                            )}
                        </Button>
                    </FieldSet>
                </form>
            }
        />
    );
}

interface FormDatePickerProps {
    control: Control<UserForm>;
    name: "dob";
    label: string;
}

function FormDatePicker({ control, name, label }: FormDatePickerProps) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <DatePickerInner
                    field={field}
                    error={fieldState.error}
                    label={label}
                />
            )}
        />
    );
}

interface DatePickerInnerProps {
    field: ControllerRenderProps<UserForm, "dob">;
    error?: { message?: string };
    label: string;
}

function DatePickerInner({ field, error, label }: DatePickerInnerProps) {
    const [open, setOpen] = useState(false);

    const [inputValue, setInputValue] = useState<string>(() =>
        formatDate(field.value)
    );
    const [month, setMonth] = useState<Date | undefined>(
        () => field.value || new Date()
    );

    useEffect(() => {
        if (field.value) {
            setInputValue(formatDate(field.value));
            setMonth(field.value);
        }
    }, [field.value]);

    return (
        <Field data-invalid={!!error} className="flex flex-col gap-2">
            <FieldLabel>{label}</FieldLabel>
            <div className="relative">
                <Input
                    value={inputValue}
                    placeholder="Select date..."
                    aria-invalid={!!error}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        const date = new Date(e.target.value);
                        if (isValidDate(date)) {
                            field.onChange(date);
                            setMonth(date);
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault();
                            setOpen(true);
                        }
                    }}
                    className="pr-10"
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-6 -translate-y-1/2 p-0 h-auto"
                        >
                            <CalendarIcon className="size-4 text-muted-foreground" />
                            <span className="sr-only">Select date</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={field.value}
                            month={month}
                            onMonthChange={setMonth}
                            captionLayout="dropdown"
                            fromYear={1900}
                            toYear={new Date().getFullYear()}
                            onSelect={(date) => {
                                field.onChange(date);
                                setInputValue(formatDate(date));
                                setOpen(false);
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            <FieldError>{error?.message}</FieldError>
        </Field>
    );
}

interface FormInputProps {
    control: Control<UserForm>;
    name:
        | "username"
        | "name"
        | "email"
        | "password"
        | "studentDetails.rollNumber"
        | "mentorDetails.employeeID"
        | "studentDetails.section"
        | "mentorDetails.designation"
        | "studentDetails.academicYear";
    label: string;
    type?: string;
    placeholder?: string;
}

function FormInput({
    control,
    name,
    label,
    type = "text",
    placeholder,
}: FormInputProps) {
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>{label}</FieldLabel>
                    {isPassword ? (
                        <InputGroup>
                            <InputGroupInput
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder={placeholder}
                                aria-invalid={!!fieldState.error}
                                value={field.value || ""}
                            />
                            <InputGroupButton
                                onClick={() => setShowPassword(!showPassword)}
                                type="button"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-4 h-4" />
                                ) : (
                                    <Eye className="w-4 h-4" />
                                )}
                            </InputGroupButton>
                        </InputGroup>
                    ) : (
                        <Input
                            {...field}
                            type={type}
                            placeholder={placeholder}
                            aria-invalid={!!fieldState.error}
                            value={field.value || ""}
                        />
                    )}
                    <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
            )}
        />
    );
}

interface FormSelectProps {
    control: Control<UserForm>;
    name:
        | "role"
        | "gender"
        | "studentDetails.department"
        | "studentDetails.section"
        | "mentorDetails.department";
    label: string;
    options: string[] | { label: string; value: string }[];
}

function FormSelect({ control, name, label, options }: FormSelectProps) {
    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <Field data-invalid={!!fieldState.error}>
                    <FieldLabel>{label}</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger aria-invalid={!!fieldState.error}>
                            <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                        <SelectContent>
                            {options.map((opt) => {
                                const value =
                                    typeof opt === "string" ? opt : opt.value;
                                const label =
                                    typeof opt === "string" ? opt : opt.label;
                                return (
                                    <SelectItem key={value} value={value}>
                                        {label}
                                    </SelectItem>
                                );
                            })}
                        </SelectContent>
                    </Select>
                    <FieldError>{fieldState.error?.message}</FieldError>
                </Field>
            )}
        />
    );
}
