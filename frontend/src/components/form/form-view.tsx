import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldSet, FieldGroup } from "../ui/field";
import { Button } from "../ui/button";

import type { Form, FieldProps, FileInputFieldProps } from "./types";

import { TextField } from "./fields/ui/TextField";
import { NumberField } from "./fields/ui/NumberField";
import { CheckboxField } from "./fields/ui/CheckboxField";
import { SelectField } from "./fields/ui/SelectField";
import { TimeField } from "./fields/ui/TimeField";
import { DateTimeField } from "./fields/ui/DateTimeField";
import { RadioField } from "./fields/ui/RadioField";

import { HeadingView } from "./views/HeadingView";
import { ParagraphView } from "./views/ParagraphView";
import { ImageView } from "./views/ImageView";
import { toast } from "sonner";
import { Loader2, RefreshCcw, Upload } from "lucide-react";
import { Alert } from "../ui/alert";
import {
  buildTextFieldSchema,
  getTextFieldDefaultValue,
} from "./fields/schema/TextField";
import {
  buildNumberFieldSchema,
  getNumberFieldDefaultValue,
} from "./fields/schema/NumberField";
import {
  buildCheckboxFieldSchema,
  getCheckboxFieldDefaultValue,
} from "./fields/schema/CheckboxField";
import {
  buildSelectFieldSchema,
  getSelectFieldDefaultValue,
} from "./fields/schema/SelectField";
import {
  buildDateFieldSchema,
  getDateFieldDefaultValue,
} from "./fields/schema/DateField";
import {
  buildFileInputFieldSchema,
  getFileInputFieldDefaultValue,
} from "./fields/schema/FileInputField";
import {
  buildTimeFieldSchema,
  getTimeFieldDefaultValue,
} from "./fields/schema/TimeField";
import {
  buildDateTimeFieldSchema,
  getDateTimeFieldDefaultValue,
} from "./fields/schema/DateTimeField";
import {
  buildRadioFieldSchema,
  getRadioFieldDefaultValue,
} from "./fields/schema/RadioField";
import { DateField } from "./fields/ui/DateField";
import { FileInputField } from "./fields/ui/FileInputField";
import {
  buildTextAreaSchema,
  getTextAreaDefaultValue,
} from "./fields/schema/Textarea";
import { TextArea } from "./fields/ui/Textarea";

function serializeForDebug(data: Record<string, unknown>) {
  const obj: Record<string, unknown> = {};

  const getFileMetadata = (file: File) => ({
    name: file.name,
    size: file.size,
    type: file.type,
    lastModified: file.lastModified,
  });

  for (const key in data) {
    const value = data[key];

    if (value instanceof File) {
      obj[key] = getFileMetadata(value);
    } else if (value instanceof FileList) {
      obj[key] = Array.from(value).map(getFileMetadata);
    } else if (
      Array.isArray(value) &&
      value.every((item) => item instanceof File)
    ) {
      obj[key] = value.map(getFileMetadata);
    } else if (value instanceof Date) {
      obj[key] = value.toISOString();
    } else {
      obj[key] = value;
    }
  }
  return obj;
}

function FormView({
  mode,
  form: { title, description, fields, onSubmit, isSubmitting, error },
}: {
  mode: "debug" | "production";
  form: Form;
}) {
  const [submittedData, setSubmittedData] = useState<null | object>(null);

  const fieldSchema: Record<string, z.ZodTypeAny> = {};
  const fieldValues: Record<string, unknown> = {};

  for (const field of fields) {
    if (field.elementType !== "field") continue;

    switch (field.fieldType) {
      case "text-field":
        fieldSchema[field.name] = buildTextFieldSchema(field);
        fieldValues[field.name] = getTextFieldDefaultValue(field);
        break;
      case "number-field":
        fieldSchema[field.name] = buildNumberFieldSchema(field);
        fieldValues[field.name] = getNumberFieldDefaultValue(field);
        break;
      case "checkbox-field":
        fieldSchema[field.name] = buildCheckboxFieldSchema(field);
        fieldValues[field.name] = getCheckboxFieldDefaultValue(field);
        break;
      case "select-field":
        fieldSchema[field.name] = buildSelectFieldSchema(field);
        fieldValues[field.name] = getSelectFieldDefaultValue(field);
        break;
      case "date-field":
        fieldSchema[field.name] = buildDateFieldSchema(field);
        fieldValues[field.name] = getDateFieldDefaultValue(field);
        break;
      case "file-input-field":
        fieldSchema[field.name] = buildFileInputFieldSchema(field);
        fieldValues[field.name] = getFileInputFieldDefaultValue(field);
        break;
      case "time-field":
        fieldSchema[field.name] = buildTimeFieldSchema(field);
        fieldValues[field.name] = getTimeFieldDefaultValue(field);
        break;
      case "date-time-field":
        fieldSchema[field.name] = buildDateTimeFieldSchema(field);
        fieldValues[field.name] = getDateTimeFieldDefaultValue(field);
        break;
      case "radio-field":
        fieldSchema[field.name] = buildRadioFieldSchema(field);
        fieldValues[field.name] = getRadioFieldDefaultValue(field);
        break;
      case "text-area":
        fieldSchema[field.name] = buildTextAreaSchema(field);
        fieldValues[field.name] = getTextAreaDefaultValue(field);
        break;
      default: {
        const rawField = field as Record<string, unknown>;
        if (rawField.fieldType === "file-field") {
          const fileField = field as unknown as FileInputFieldProps;
          fieldSchema[rawField.name as string] =
            buildFileInputFieldSchema(fileField);
          fieldValues[rawField.name as string] =
            getFileInputFieldDefaultValue(fileField);
        }
        break;
      }
    }
  }

  const formSchema = z.object(fieldSchema);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: fieldValues,
    mode: "all",
  });

  function handleSubmit(values: z.infer<typeof formSchema>) {
    if (isSubmitting) return;

    if (mode === "debug") {
      setSubmittedData(serializeForDebug(values));
      console.log(values);
      return;
    }

    if (onSubmit) {
      onSubmit(values);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="p-4">
      <FormProvider {...form}>
        <div className="mb-8 space-y-2 text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground text-sm">{description}</p>
          )}
        </div>
        <FieldSet>
          <FieldGroup>
            {fields.map((element, idx) => {
              if (element.elementType === "field") {
                switch (element.fieldType) {
                  case "text-field":
                    return <TextField key={idx} {...element} />;
                  case "text-area":
                    return <TextArea key={idx} {...element} />;
                  case "number-field":
                    return <NumberField key={idx} {...element} />;
                  case "checkbox-field":
                    return <CheckboxField key={idx} {...element} />;
                  case "select-field":
                    return <SelectField key={idx} {...element} />;
                  case "date-field":
                    return <DateField key={idx} {...element} />;
                  case "file-input-field":
                    return <FileInputField key={idx} {...element} />;
                  case "time-field":
                    return <TimeField key={idx} {...element} />;
                  case "date-time-field":
                    return <DateTimeField key={idx} {...element} />;
                  case "radio-field":
                    return <RadioField key={idx} {...element} />;
                  default: {
                    const rawElement = element as Record<string, unknown>;
                    if (rawElement.fieldType === "file-field") {
                      return (
                        <FileInputField
                          key={idx}
                          {...(element as unknown as FileInputFieldProps)}
                        />
                      );
                    }
                    return null;
                  }
                }
              }

              if (element.elementType === "view") {
                switch (element.viewType) {
                  case "heading":
                    return <HeadingView key={idx} {...element} />;
                  case "paragraph":
                    return <ParagraphView key={idx} {...element} />;
                  case "image":
                    return <ImageView key={idx} {...element} />;
                }
              }

              return null;
            })}
          </FieldGroup>
        </FieldSet>

        {error && <Alert variant={"destructive"}>{error}</Alert>}

        <div className="w-full flex flex-col gap-2 mt-4 font-mono">
          {mode === "debug" && submittedData && (
            <div className="bg-muted p-4 rounded-lg border border-border overflow-x-auto">
              <pre className="text-sm">
                {JSON.stringify(submittedData, undefined, 2)}
              </pre>
            </div>
          )}

          {fields.find((f): f is FieldProps => f.elementType === "field") && (
            <div className="flex justify-end gap-2 mt-2">
              {mode === "debug" && (
                <Button
                  type="reset"
                  variant={"outline"}
                  onClick={() => {
                    form.reset(fieldValues);
                    setSubmittedData(null);
                    toast.info("Form reset success!");
                  }}
                >
                  <RefreshCcw />
                  Reset
                </Button>
              )}
              <Button type="submit">
                {isSubmitting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Upload />
                    Submit
                  </span>
                )}
              </Button>
            </div>
          )}
        </div>
      </FormProvider>
    </form>
  );
}

export default FormView;
