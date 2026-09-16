import { Card, CardContent } from "@/components/ui/card";
import type {
    CheckboxFieldProps,
    DateFieldProps,
    DateTimeFieldProps,
    FieldProps,
    FileInputFieldProps,
    Form,
    FormElement,
    LucideIconName,
    NumberFieldProps,
    RadioFieldProps,
    SelectFieldProps,
    TextAreaProps,
    TextFieldProps,
    TimeFieldProps,
    ViewProps,
} from "./types";
import { FieldIcon } from "./FieldIcon";
import { Button } from "../ui/button";
import { useState } from "react";
import FormView from "./form-view";
import { FieldGroup } from "../ui/field";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { ScrollArea } from "../ui/scroll-area";

import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Pencil, Trash2 } from "lucide-react";
import SimpleDialog from "../dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { GripVertical } from "lucide-react";
import { toast } from "sonner";
import { ImageOptions } from "./views/ImageView";
import { ParagraphOptions } from "./views/ParagraphView";
import { HeadingOptions } from "./views/HeadingView";
import { FileInputFieldOptions } from "./fields/ui/FileInputField";
import { DateTimeFieldOptions } from "./fields/ui/DateTimeField";
import { TimeFieldOptions } from "./fields/ui/TimeField";
import { DateFieldOptions } from "./fields/ui/DateField";
import { CheckboxFieldOptions } from "./fields/ui/CheckboxField";
import { RadioFieldOptions } from "./fields/ui/RadioField";
import { SelectFieldOptions } from "./fields/ui/SelectField";
import { NumberFieldOptions } from "./fields/ui/NumberField";
import { TextAreaOptions } from "./fields/ui/Textarea";
import { TextFieldOptions } from "./fields/ui/TextField";

export interface BaseFormElementRenderProps {
    icon: LucideIconName;
    name: string;
    elementType: "field" | "view";
}

export interface BaseFormFieldRenderProps extends BaseFormElementRenderProps {
    elementType: "field";
    fieldType: FieldProps["fieldType"];
}

export interface BaseFormViewRenderProps extends BaseFormElementRenderProps {
    elementType: "view";
    viewType: ViewProps["viewType"];
}

export type FormElementRenderProps =
    | BaseFormFieldRenderProps
    | BaseFormViewRenderProps;

function generateUniqueName(fieldType: FieldProps["fieldType"]): string {
    return fieldType + "-" + Math.random().toString(36).substring(7);
}

function generateId(type: string): string {
    return `${type}-${Math.random().toString(36).substring(2, 9)}`;
}

function generateFormElement(e: FormElementRenderProps): FormElement & {
    id: string;
} {
    const id = generateId(
        e.elementType === "field"
            ? (e as BaseFormFieldRenderProps).fieldType
            : (e as BaseFormViewRenderProps).viewType,
    );
    const generate = (e: FormElementRenderProps) => {
        switch (e.elementType) {
            case "field":
                {
                    const name = generateUniqueName(e.fieldType);

                    switch (e.fieldType) {
                        case "text-field":
                            return {
                                elementType: "field",
                                fieldType: "text-field",
                                name,
                                type: "text",
                                label: "Text Field",
                                placeholder: "Enter text",
                                required: false,
                            } as FormElement;
                        case "text-area":
                            return {
                                elementType: "field",
                                fieldType: "text-area",
                                name,
                                label: "Text Area",
                                placeholder: "Enter text",
                                required: false,
                            } as FormElement;
                        case "number-field":
                            return {
                                elementType: "field",
                                fieldType: "number-field",
                                name,
                                label: "Number Field",
                                placeholder: "Enter number",
                                icon: "Hash",
                                required: false,
                            } as FormElement;

                        case "select-field":
                            return {
                                elementType: "field",
                                fieldType: "select-field",
                                name,
                                label: "Select Field",
                                placeholder: "Select option",
                                options: [
                                    { value: "option1", label: "Option 1" },
                                    { value: "option2", label: "Option 2" },
                                ],
                                required: false,
                            } as FormElement;

                        case "radio-field":
                            return {
                                elementType: "field",
                                fieldType: "radio-field",
                                name,
                                label: "Radio Field",
                                layout: "column",
                                options: [
                                    { value: "option1", label: "Option 1" },
                                    { value: "option2", label: "Option 2" },
                                ],
                                required: false,
                            } as FormElement;

                        case "checkbox-field":
                            return {
                                elementType: "field",
                                fieldType: "checkbox-field",
                                name,
                                label: "Checkbox Field",
                                defaultValue: false,
                                required: false,
                            } as FormElement;

                        case "date-field":
                            return {
                                elementType: "field",
                                fieldType: "date-field",
                                name,
                                label: "Date Field",
                                placeholder: "Pick a date",
                                required: false,
                            } as FormElement;

                        case "time-field":
                            return {
                                elementType: "field",
                                fieldType: "time-field",
                                name,
                                meridian: "am",
                                placeholder: "Pick time",
                                required: false,
                            } as FormElement;

                        case "date-time-field":
                            return {
                                elementType: "field",
                                fieldType: "date-time-field",
                                name,
                                label: "Date Time Field",
                                placeholder: "Pick date & time",
                                required: false,
                            } as FormElement;

                        case "file-input-field":
                            return {
                                elementType: "field",
                                fieldType: "file-input-field",
                                name,
                                label: "File Upload",
                                accept: "all",
                                multiple: false,
                                required: false,
                            } as FormElement;
                    }
                }
                break;

            case "view": {
                switch (e.viewType) {
                    case "heading":
                        return {
                            elementType: "view",
                            viewType: "heading",
                            level: 2,
                            text: "Heading Text",
                            align: "left",
                            mt: 2,
                            mb: 2,
                        } as FormElement;

                    case "paragraph":
                        return {
                            elementType: "view",
                            viewType: "paragraph",
                            text: "Lorem ipsum paragraph text...",
                            mt: 2,
                            mb: 2,
                        } as FormElement;

                    case "image":
                        return {
                            elementType: "view",
                            viewType: "image",
                            src: "https://placehold.co/600x300",
                            alt: "Image",
                            width: 600,
                            height: 300,
                            fit: "cover",
                            align: "center",
                            rounded: 8,
                            mt: 2,
                            mb: 2,
                        } as FormElement;
                }
            }
        }

        throw new Error("Unsupported form element");
    };
    return { ...generate(e), id };
}

const formElements: FormElementRenderProps[] = [
    {
        icon: "Type",
        name: "Text Field",
        elementType: "field",
        fieldType: "text-field",
    },
    {
        icon: "ALargeSmall",
        name: "Text Area",
        elementType: "field",
        fieldType: "text-area",
    },
    {
        icon: "Hash",
        name: "Number Field",
        elementType: "field",
        fieldType: "number-field",
    },
    {
        icon: "ChevronDown",
        name: "Select Field",
        elementType: "field",
        fieldType: "select-field",
    },
    {
        icon: "CircleDot",
        name: "Radio Field",
        elementType: "field",
        fieldType: "radio-field",
    },
    {
        icon: "CheckSquare",
        name: "Checkbox Field",
        elementType: "field",
        fieldType: "checkbox-field",
    },
    {
        icon: "Calendar",
        name: "Date Field",
        elementType: "field",
        fieldType: "date-field",
    },
    {
        icon: "Clock",
        name: "Time Field",
        elementType: "field",
        fieldType: "time-field",
    },
    {
        icon: "CalendarClock",
        name: "Date Time Field",
        elementType: "field",
        fieldType: "date-time-field",
    },
    {
        icon: "Upload",
        name: "File Upload",
        elementType: "field",
        fieldType: "file-input-field",
    },
    {
        icon: "Heading",
        name: "Heading",
        elementType: "view",
        viewType: "heading",
    },
    {
        icon: "AlignLeft",
        name: "Paragraph",
        elementType: "view",
        viewType: "paragraph",
    },
    // {
    //     icon: "Image",
    //     name: "Image",
    //     elementType: "view",
    //     viewType: "image",
    // },
];

function SortableField({
    field,
    id,
    setSelected,
    setDeleteOpen,
    setEditOpen,
}: {
    field: FormElement;
    id: string;
    setSelected: (id: string | undefined) => void;
    setDeleteOpen: (open: boolean) => void;
    setEditOpen: (open: boolean) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 50 : undefined,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`p-4 bg-background border rounded-md shadow-sm text-sm border-border flex justify-between items-center transition-opacity ${isDragging ? "opacity-40 ring-2 ring-primary/20" : ""}`}
        >
            <div className="flex items-center gap-3">
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing p-1.5 hover:bg-muted rounded text-muted-foreground transition-colors"
                >
                    <GripVertical size={18} />
                </div>

                <div className="flex flex-col">
                    <div className="flex items-center">
                        <span className="font-medium">
                            {field.elementType === "field"
                                ? field.name
                                : field.viewType}
                        </span>
                        <span className="ml-2 text-[10px] text-muted-foreground uppercase bg-muted px-1.5 py-0.5 rounded">
                            {field.elementType}
                        </span>
                    </div>
                    <div className="mt-1">
                        <span
                            className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${
                                field.elementType === "field"
                                    ? "bg-chart-1/10 border-chart-1/20 text-chart-1"
                                    : "bg-chart-2/10 border-chart-2/20 text-chart-2"
                            }`}
                        >
                            {field.elementType === "field"
                                ? field.fieldType
                                : field.viewType}
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex gap-2">
                <Button
                    size="icon"
                    variant="outline"
                    className="h-8 w-8"
                    onClick={() => {
                        setSelected(id);
                        setEditOpen(true);
                    }}
                >
                    <Pencil size={14} />
                </Button>
                <Button
                    size="icon"
                    className="h-8 w-8"
                    variant="destructive"
                    onClick={() => {
                        setSelected(id);
                        setDeleteOpen(true);
                    }}
                >
                    <Trash2 size={14} />
                </Button>
            </div>
        </div>
    );
}

export default function FormBuilder({
    onSave,
    isSubmitting,
    show,
    setShow,
    form,
}: {
    form?: Form;
    onSave: (e: Form) => void;
    isSubmitting: boolean;
    show: boolean;
    setShow: (show: boolean) => void;
}) {
    const [title, setTitle] = useState(form?.title ?? "New Complaint Form");
    const [description, setDescription] = useState(
        form?.description ?? "Enter the description",
    );
    const [fields, setFields] = useState<FormElement[]>(form?.fields ?? []);

    const [selected, setSelected] = useState<string | undefined>();
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);

    const addElement = (elementProps: FormElementRenderProps) => {
        const newElement = generateFormElement(elementProps);
        setFields([...fields, newElement]);
    };

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setFields((items) => {
                const oldIndex = items.findIndex((f) => f.id === active.id);
                const newIndex = items.findIndex((f) => f.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    function handleDelete() {
        setFields(fields.filter((f) => f.id !== selected));
        setSelected(undefined);
        setDeleteOpen(false);
        toast.info("Element deleted successfully!");
    }

    return (
        <Dialog
            open={show}
            onOpenChange={(e) => {
                setShow(e);
            }}
        >
            <DialogHeader></DialogHeader>
            <DialogContent
                showCloseButton={false}
                className="p-0 overflow-hidden gap-0"
                style={{
                    width: "98vw",
                    maxWidth: "98vw",
                    height: "95vh",
                    maxHeight: "95vh",
                }}
            >
                <div className="flex flex-col bg-background gap-4">
                    {deleteOpen && (
                        <SimpleDialog
                            open={deleteOpen}
                            onOpenChange={setDeleteOpen}
                            header={
                                "Are you sure you want to delete this element?"
                            }
                            body={"This action cannot be undone."}
                            footer={
                                <div className="flex justify-end gap-2">
                                    <Button
                                        variant={"destructive"}
                                        onClick={handleDelete}
                                    >
                                        Delete
                                    </Button>
                                </div>
                            }
                        />
                    )}

                    {editOpen && (
                        <SimpleDialog
                            open={editOpen}
                            onOpenChange={setEditOpen}
                            header={"Edit Element"}
                            body={
                                <div>
                                    {(() => {
                                        const selectedElement = fields.find(
                                            (f) => f.id === selected,
                                        );
                                        if (!selectedElement) return null;

                                        if (
                                            selectedElement.elementType ===
                                                "field" &&
                                            selectedElement.fieldType ===
                                                "text-field"
                                        ) {
                                            return (
                                                <TextFieldOptions
                                                    key={selectedElement.id}
                                                    element={
                                                        fields.find(
                                                            (f) =>
                                                                f.id ===
                                                                selected,
                                                        ) as TextFieldProps
                                                    }
                                                    formElements={fields}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                    onCancel={() =>
                                                        setEditOpen(false)
                                                    }
                                                />
                                            );
                                        }

                                        if (
                                            selectedElement.elementType ===
                                                "field" &&
                                            selectedElement.fieldType ===
                                                "text-area"
                                        ) {
                                            return (
                                                <TextAreaOptions
                                                    key={selectedElement.id}
                                                    element={
                                                        fields.find(
                                                            (f) =>
                                                                f.id ===
                                                                selected,
                                                        ) as TextAreaProps
                                                    }
                                                    formElements={fields}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                    onCancel={() =>
                                                        setEditOpen(false)
                                                    }
                                                />
                                            );
                                        }
                                        if (
                                            selectedElement.elementType ===
                                                "field" &&
                                            selectedElement.fieldType ===
                                                "number-field"
                                        ) {
                                            return (
                                                <NumberFieldOptions
                                                    key={selectedElement.id}
                                                    element={
                                                        fields.find(
                                                            (f) =>
                                                                f.id ===
                                                                selected,
                                                        ) as NumberFieldProps
                                                    }
                                                    formElements={fields}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                    onCancel={() =>
                                                        setEditOpen(false)
                                                    }
                                                />
                                            );
                                        }
                                        if (
                                            selectedElement.elementType ===
                                                "field" &&
                                            selectedElement.fieldType ===
                                                "select-field"
                                        ) {
                                            return (
                                                <SelectFieldOptions
                                                    key={selectedElement.id}
                                                    element={
                                                        fields.find(
                                                            (f) =>
                                                                f.id ===
                                                                selected,
                                                        ) as SelectFieldProps
                                                    }
                                                    formElements={fields}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                    onCancel={() =>
                                                        setEditOpen(false)
                                                    }
                                                />
                                            );
                                        }
                                        if (
                                            selectedElement.elementType ===
                                                "field" &&
                                            selectedElement.fieldType ===
                                                "radio-field"
                                        ) {
                                            return (
                                                <RadioFieldOptions
                                                    key={selectedElement.id}
                                                    element={
                                                        fields.find(
                                                            (f) =>
                                                                f.id ===
                                                                selected,
                                                        ) as RadioFieldProps
                                                    }
                                                    formElements={fields}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                    onCancel={() =>
                                                        setEditOpen(false)
                                                    }
                                                />
                                            );
                                        }
                                        if (
                                            selectedElement.elementType ===
                                                "field" &&
                                            selectedElement.fieldType ===
                                                "checkbox-field"
                                        ) {
                                            return (
                                                <CheckboxFieldOptions
                                                    key={selectedElement.id}
                                                    element={
                                                        fields.find(
                                                            (f) =>
                                                                f.id ===
                                                                selected,
                                                        ) as CheckboxFieldProps
                                                    }
                                                    formElements={fields}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                    onCancel={() =>
                                                        setEditOpen(false)
                                                    }
                                                />
                                            );
                                        }
                                        if (
                                            selectedElement.elementType ===
                                                "field" &&
                                            selectedElement.fieldType ===
                                                "date-field"
                                        ) {
                                            return (
                                                <DateFieldOptions
                                                    key={selectedElement.id}
                                                    element={
                                                        fields.find(
                                                            (f) =>
                                                                f.id ===
                                                                selected,
                                                        ) as DateFieldProps
                                                    }
                                                    formElements={fields}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                    onCancel={() =>
                                                        setEditOpen(false)
                                                    }
                                                />
                                            );
                                        }
                                        if (
                                            selectedElement.elementType ===
                                                "field" &&
                                            selectedElement.fieldType ===
                                                "time-field"
                                        ) {
                                            return (
                                                <TimeFieldOptions
                                                    key={selectedElement.id}
                                                    element={
                                                        fields.find(
                                                            (f) =>
                                                                f.id ===
                                                                selected,
                                                        ) as TimeFieldProps
                                                    }
                                                    formElements={fields}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                    onCancel={() =>
                                                        setEditOpen(false)
                                                    }
                                                />
                                            );
                                        }
                                        if (
                                            selectedElement.elementType ===
                                                "field" &&
                                            selectedElement.fieldType ===
                                                "date-time-field"
                                        ) {
                                            return (
                                                <DateTimeFieldOptions
                                                    key={selectedElement.id}
                                                    element={
                                                        fields.find(
                                                            (f) =>
                                                                f.id ===
                                                                selected,
                                                        ) as DateTimeFieldProps
                                                    }
                                                    formElements={fields}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                    onCancel={() =>
                                                        setEditOpen(false)
                                                    }
                                                />
                                            );
                                        }
                                        if (
                                            selectedElement.elementType ===
                                                "field" &&
                                            selectedElement.fieldType ===
                                                "file-input-field"
                                        ) {
                                            return (
                                                <FileInputFieldOptions
                                                    key={selectedElement.id}
                                                    element={
                                                        fields.find(
                                                            (f) =>
                                                                f.id ===
                                                                selected,
                                                        ) as FileInputFieldProps
                                                    }
                                                    formElements={fields}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                    onCancel={() =>
                                                        setEditOpen(false)
                                                    }
                                                />
                                            );
                                        }

                                        if (
                                            selectedElement.elementType ===
                                                "view" &&
                                            selectedElement.viewType ===
                                                "heading"
                                        ) {
                                            return (
                                                <HeadingOptions
                                                    key={selectedElement.id}
                                                    element={selectedElement}
                                                    onCancel={() => {
                                                        setEditOpen(false);
                                                    }}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                />
                                            );
                                        }
                                        if (
                                            selectedElement.elementType ===
                                                "view" &&
                                            selectedElement.viewType ===
                                                "paragraph"
                                        ) {
                                            return (
                                                <ParagraphOptions
                                                    key={selectedElement.id}
                                                    element={selectedElement}
                                                    onCancel={() => {
                                                        setEditOpen(false);
                                                    }}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                />
                                            );
                                        }
                                        if (
                                            selectedElement.elementType ===
                                                "view" &&
                                            selectedElement.viewType === "image"
                                        ) {
                                            return (
                                                <ImageOptions
                                                    key={selectedElement.id}
                                                    element={selectedElement}
                                                    onCancel={() => {
                                                        setEditOpen(false);
                                                    }}
                                                    onSave={(updated) => {
                                                        setFields(
                                                            fields.map((f) =>
                                                                f.id ===
                                                                selected
                                                                    ? updated
                                                                    : f,
                                                            ),
                                                        );
                                                        setEditOpen(false);
                                                        toast.success(
                                                            "Properties saved",
                                                        );
                                                    }}
                                                />
                                            );
                                        }

                                        return (
                                            <p className="text-sm text-muted-foreground">
                                                Options for this element are not
                                                yet implemented.
                                            </p>
                                        );
                                    })()}
                                </div>
                            }
                        />
                    )}

                    <div className="grid flex-1 grid-cols-12 overflow-hidden h-[calc(95vh-60px)]">
                        <aside className="col-span-2 border-r bg-background flex flex-col">
                            <ScrollArea className="h-[calc(95vh-60px)]">
                                <div className="p-3 space-y-4">
                                    <section>
                                        <h3 className="mb-2 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
                                            Views
                                        </h3>
                                        <div className="grid gap-1">
                                            {formElements
                                                .filter(
                                                    (e) =>
                                                        e.elementType ===
                                                        "view",
                                                )
                                                .map((e) => (
                                                    <Button
                                                        key={e.name}
                                                        variant="outline"
                                                        onClick={() =>
                                                            addElement(e)
                                                        }
                                                        className="justify-start gap-2 text-[11px] h-8 px-2"
                                                    >
                                                        <FieldIcon
                                                            name={e.icon}
                                                        />
                                                        <span className="truncate">
                                                            {e.name}
                                                        </span>
                                                    </Button>
                                                ))}
                                        </div>
                                    </section>
                                    <section>
                                        <h3 className="mb-2 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground">
                                            Fields
                                        </h3>
                                        <div className="grid gap-1">
                                            {formElements
                                                .filter(
                                                    (e) =>
                                                        e.elementType ===
                                                        "field",
                                                )
                                                .map((e) => (
                                                    <Button
                                                        key={e.name}
                                                        variant="outline"
                                                        onClick={() =>
                                                            addElement(e)
                                                        }
                                                        className="justify-start gap-2 text-[11px] h-8 px-2"
                                                    >
                                                        <FieldIcon
                                                            name={e.icon}
                                                        />
                                                        <span className="truncate">
                                                            {e.name}
                                                        </span>
                                                    </Button>
                                                ))}
                                        </div>
                                    </section>
                                </div>
                            </ScrollArea>
                        </aside>

                        <main className="col-span-5 bg-muted/30 border-r flex flex-col">
                            <div className="px-4 py-2 border-b bg-background/50">
                                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    Canvas
                                </h3>
                            </div>
                            <ScrollArea className="h-[calc(95vh-92px)]">
                                <div className="p-4">
                                    <Card className="shadow-none border-dashed bg-background">
                                        <CardContent className="p-4 space-y-4">
                                            <div className="space-y-2 border-b pb-4">
                                                <FieldGroup className="gap-2">
                                                    <div className="grid gap-1">
                                                        <label className="text-[11px] font-medium">
                                                            Title
                                                        </label>
                                                        <Input
                                                            className="h-8 text-xs"
                                                            value={title}
                                                            onChange={(e) =>
                                                                setTitle(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                    <div className="grid gap-1">
                                                        <label className="text-[11px] font-medium">
                                                            Description
                                                        </label>
                                                        <Textarea
                                                            className="min-h-[60px] text-xs"
                                                            value={description}
                                                            onChange={(e) =>
                                                                setDescription(
                                                                    e.target
                                                                        .value,
                                                                )
                                                            }
                                                        />
                                                    </div>
                                                </FieldGroup>
                                            </div>

                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={
                                                    closestCenter
                                                }
                                                onDragEnd={handleDragEnd}
                                            >
                                                <SortableContext
                                                    items={fields.map(
                                                        (f) => f.id,
                                                    )}
                                                    strategy={
                                                        verticalListSortingStrategy
                                                    }
                                                >
                                                    <div className="space-y-2">
                                                        {fields.length === 0 ? (
                                                            <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-12 bg-muted/20">
                                                                <p className="text-[11px] text-muted-foreground">
                                                                    Click
                                                                    elements to
                                                                    add
                                                                </p>
                                                            </div>
                                                        ) : (
                                                            fields.map(
                                                                (field) => (
                                                                    <SortableField
                                                                        key={
                                                                            field.id
                                                                        }
                                                                        id={
                                                                            field.id
                                                                        }
                                                                        field={
                                                                            field
                                                                        }
                                                                        setSelected={
                                                                            setSelected
                                                                        }
                                                                        setDeleteOpen={
                                                                            setDeleteOpen
                                                                        }
                                                                        setEditOpen={
                                                                            setEditOpen
                                                                        }
                                                                    />
                                                                ),
                                                            )
                                                        )}
                                                    </div>
                                                </SortableContext>
                                            </DndContext>
                                        </CardContent>
                                    </Card>
                                </div>
                            </ScrollArea>
                        </main>

                        <aside className="col-span-5 bg-muted/30 flex flex-col">
                            <div className="px-4 py-2 border-b bg-background/50">
                                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase">
                                    Preview
                                </h3>
                            </div>
                            <ScrollArea className="h-[calc(95vh-93px)]">
                                <div className="p-4">
                                    <Card className="shadow-sm bg-background">
                                        <CardContent className="p-4">
                                            <FormView
                                                mode="debug"
                                                form={{
                                                    title,
                                                    description,
                                                    fields,
                                                    onSubmit: (values) =>
                                                        console.log(values),
                                                }}
                                            />
                                        </CardContent>
                                    </Card>
                                </div>
                            </ScrollArea>
                        </aside>
                    </div>
                </div>
                <footer className="w-full flex justify-between gap-3 px-4 py-2 border-t bg-background items-center">
                    <div>
                        <DialogTitle>New Complaint Type</DialogTitle>
                    </div>

                    <div className="flex flex-row gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (show) {
                                    setShow(false);
                                }
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            disabled={isSubmitting}
                            size="sm"
                            onClick={() => {
                                onSave({
                                    title,
                                    description,
                                    fields,
                                    onSubmit: () => {},
                                });
                            }}
                        >
                            Save
                        </Button>
                    </div>
                </footer>
            </DialogContent>
        </Dialog>
    );
}
