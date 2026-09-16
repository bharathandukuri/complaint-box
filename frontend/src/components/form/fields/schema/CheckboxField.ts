import { z } from "zod";
import type { CheckboxFieldProps } from "../../types";

export function buildCheckboxFieldSchema(props: CheckboxFieldProps) {
    let schema = z.boolean();

    if (props?.required) {
        schema = schema.refine((v) => v === true, {
            error: "This field must be checked",
        });
    }

    return schema;
}

export function getCheckboxFieldDefaultValue(props: CheckboxFieldProps) {
    return props.defaultValue ?? false;
}
