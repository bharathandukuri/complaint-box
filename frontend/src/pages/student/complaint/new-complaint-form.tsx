import { useState, Suspense, memo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import type { ComplaintType } from "@/types/complaint-type";
import FormView from "@/components/form/form-view";
import { useGetComplaintTypes } from "@/api/complaint-type";
import Dialog from "@/components/dialog";
import { useSubmitComplaintWithFileUpload } from "@/api/complaint";
import { toast } from "sonner";
import { queryClient } from "@/main";

const ComplaintList = memo(
    ({
        complaints,
        onSelect,
        selectedId,
    }: {
        complaints: ComplaintType[];
        onSelect: (c: ComplaintType) => void;
        selectedId: number | null;
    }) => {
        if (!complaints || complaints.length === 0)
            return (
                <div className="text-center text-muted-foreground py-10">
                    No complaint types found.
                </div>
            );

        return (
            <ul className="space-y-3">
                {complaints.map((c) => (
                    <Card
                        key={c.id}
                        className={`p-4 cursor-pointer transition border ${
                            selectedId === c.id
                                ? "border-primary bg-primary/10"
                                : "border-gray-200"
                        } hover:bg-muted`}
                        onClick={() => onSelect(c)}
                    >
                        <h3 className="font-semibold">{c.title}</h3>
                        <p className="text-sm text-muted-foreground">
                            {c.description}
                        </p>
                    </Card>
                ))}
            </ul>
        );
    },
);

function StepTracker({ step }: { step: "select" | "details" | "form" }) {
    const steps = ["Select Type", "Details", "Form"];
    const currentIndex = step === "select" ? 0 : step === "details" ? 1 : 2;

    return (
        <div className="flex items-center gap-4 mb-4">
            {steps.map((label, idx) => (
                <div key={label} className="flex items-center gap-2 flex-1">
                    <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center border ${
                            idx <= currentIndex
                                ? "bg-primary text-white border-primary"
                                : "border-gray-300 text-gray-500"
                        }`}
                    >
                        {idx + 1}
                    </div>
                    <span
                        className={`${
                            idx <= currentIndex
                                ? "font-semibold"
                                : "text-gray-500"
                        }`}
                    >
                        {label}
                    </span>
                    {idx < steps.length - 1 && (
                        <div
                            className={`flex-1 h-[2px] ${
                                idx < currentIndex
                                    ? "bg-primary"
                                    : "bg-gray-300"
                            }`}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}

export default function NewComplaintForm({
    open,
    setOpen,
}: {
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const [search, setSearch] = useState("");
    const [selectedComplaint, setSelectedComplaint] =
        useState<ComplaintType | null>(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [step, setStep] = useState<"select" | "details" | "form">("select");

    const {
        data: complaints = [],
        isLoading,
        isError,
        refetch,
    } = useGetComplaintTypes();

    const filteredComplaints = complaints.filter(
        (c) =>
            c.title.toLowerCase().includes(search.toLowerCase()) ||
            c.description.toLowerCase().includes(search.toLowerCase()),
    );

    const handleSelectComplaint = (c: ComplaintType) => {
        setSelectedComplaint(c);
        setStep("details");
    };

    const { mutate, isPending, error } = useSubmitComplaintWithFileUpload();

    return (
        <Dialog
            open={open}
            onOpenChange={setOpen}
            className="sm:max-w-2xl max-h-[95vh] overflow-auto"
            body={
                <div className="flex flex-col gap-6 pb-5">
                    {step === "select" && (
                        <>
                            <StepTracker step="select" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search complaint types..."
                            />
                            {isLoading && (
                                <div className="flex gap-2 items-center">
                                    <Loader2 className="animate-spin" /> Loading
                                    complaint types...
                                </div>
                            )}
                            {isError && (
                                <div className="text-red-500 flex flex-col gap-2">
                                    Failed to load complaint types.{" "}
                                    <Button onClick={() => refetch()}>
                                        Retry
                                    </Button>
                                </div>
                            )}
                            {!isLoading && !isError && (
                                <ComplaintList
                                    complaints={filteredComplaints}
                                    onSelect={handleSelectComplaint}
                                    selectedId={selectedComplaint?.id ?? null}
                                />
                            )}
                        </>
                    )}

                    {step === "details" && selectedComplaint && (
                        <>
                            <StepTracker step="details" />
                            <Card className="p-4 flex flex-col gap-4">
                                <div className="flex flex-col gap-4">
                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="complaint-title"
                                            className="font-semibold mb-1"
                                        >
                                            Complaint Title
                                        </label>
                                        <Input
                                            id="complaint-title"
                                            placeholder="Enter complaint title"
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                        />
                                    </div>

                                    <div className="flex flex-col">
                                        <label
                                            htmlFor="complaint-description"
                                            className="font-semibold mb-1"
                                        >
                                            Complaint Description
                                        </label>
                                        <textarea
                                            id="complaint-description"
                                            className="border rounded-md p-2 w-full resize-none h-32"
                                            placeholder="Enter complaint description"
                                            value={description}
                                            onChange={(e) =>
                                                setDescription(e.target.value)
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-2 justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => setStep("select")}
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        onClick={() =>
                                            title.trim() &&
                                            description.trim() &&
                                            setStep("form")
                                        }
                                    >
                                        Next
                                    </Button>
                                </div>
                            </Card>
                        </>
                    )}

                    {step === "form" && selectedComplaint && (
                        <>
                            <StepTracker step="form" />
                            <Card className="p-4 flex flex-col gap-4">
                                <Suspense fallback={<div>Loading form...</div>}>
                                    <FormView
                                        form={{
                                            ...selectedComplaint,
                                            isSubmitting: isPending,
                                            error: isError
                                                ? (error?.response?.data
                                                      .message ??
                                                  error?.message ??
                                                  "Internal error.")
                                                : undefined,
                                            onSubmit: (e) => {
                                                mutate(
                                                    {
                                                        title,
                                                        description,
                                                        meta: e,
                                                        complaintTypeId:
                                                            selectedComplaint.id,
                                                    },
                                                    {
                                                        onSuccess: () => {
                                                            toast.success(
                                                                "Complaint submitted successfully",
                                                            );
                                                            queryClient.invalidateQueries(
                                                                {
                                                                    queryKey: [
                                                                        "complaints",
                                                                        "student",
                                                                    ],
                                                                },
                                                            );
                                                            setOpen(false);
                                                        },
                                                    },
                                                );
                                            },
                                        }}
                                        mode="production"
                                    />
                                </Suspense>
                            </Card>
                        </>
                    )}
                </div>
            }
        />
    );
}
