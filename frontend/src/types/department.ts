import type { Section } from "./section";

export interface Department {
    code: string;
    name: string;
    sections: Section[];
}

export interface AssignedDepartments {
    code: string;
    sections: string[];
}
