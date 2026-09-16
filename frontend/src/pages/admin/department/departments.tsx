import { useState } from "react";
import { useGetAllDepartments } from "@/api/department";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import type { Department } from "@/types/department";
import type { Section } from "@/types/section";
import { Button } from "@/components/ui/button";
import OptionsButton from "@/components/options-button";
import AddDepartmentDialog from "./add-department-dialog";
import DeleteDepartmentDialog from "./delete-department-dialog";
import EditDepartmentDialog from "./edit-department-dialog";

function Departments() {
    const {
        refetch: fetchDepartments,
        data: departments = [],
        isLoading: isDepartmentsLoading,
        error: departmentsError,
    } = useGetAllDepartments();

    const [selected, setSelected] = useState<Department | null>(null);
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);

    function onEdit(department: Department) {
        setSelected(department);
        setEditDialog(true);
    }

    function onDelete(department: Department) {
        setSelected(department);
        setDeleteDialog(true);
    }

    return (
        <div className="flex flex-col p-5 space-y-5">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-poppins">Departments</h1>
                <AddDepartmentDialog />
            </div>

            <DeleteDepartmentDialog
                department={selected}
                open={deleteDialog}
                setOpen={setDeleteDialog}
                setDepartment={setSelected}
            />

            <EditDepartmentDialog
                department={selected}
                setDepartment={setSelected}
                open={editDialog}
                setOpen={setEditDialog}
            />

            <Table>
                <TableHeader className="bg-primary">
                    <TableRow className="hover:bg-primary">
                        <TableHead className="text-primary-foreground font-bold">
                            CODE
                        </TableHead>
                        <TableHead className="text-primary-foreground font-bold">
                            NAME
                        </TableHead>
                        <TableHead className="text-primary-foreground font-bold">
                            SECTIONS
                        </TableHead>
                        <TableHead className="text-primary-foreground font-bold rounded-tr-md text-right">
                            ACTIONS
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody className="bg-secondary">
                    {isDepartmentsLoading ? (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="py-10 text-center"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" />
                                    Loading departments...
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : departmentsError ? (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="py-10 text-center text-red-500 space-y-4"
                            >
                                <div>
                                    {departmentsError.response?.data.message ??
                                        departmentsError.message}
                                </div>
                                <Button onClick={() => fetchDepartments()}>
                                    Retry
                                </Button>
                            </TableCell>
                        </TableRow>
                    ) : departments.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={4}
                                className="py-12 text-center text-muted-foreground"
                            >
                                No departments found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        departments.map((department, index) => (
                            <DepartmentRow
                                onEdit={onEdit}
                                onDelete={onDelete}
                                key={index}
                                department={department}
                            />
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

function DepartmentRow({
    department,
    onEdit,
    onDelete,
}: {
    department: Department;
    onEdit: (department: Department) => void;
    onDelete: (department: Department) => void;
}) {
    const sectionSize = department.sections.length;
    const allSections = department.sections ?? [];

    const chunked: Section[][] = [];
    for (let i = 0; i < allSections.length; i += sectionSize) {
        chunked.push(allSections.slice(i, i + sectionSize));
    }

    return chunked.map((group, index) => (
        <>
            <TableRow key={`${department.name}-${index}`}>
                <TableCell>{index === 0 ? department.code : ""}</TableCell>
                <TableCell>{index === 0 ? department.name : ""}</TableCell>
                <TableCell>{group.map((s) => s.name).join(", ")}</TableCell>
                <TableCell className="text-right">
                    {index === 0 && (
                        <OptionsButton
                            loading={false}
                            options={[
                                {
                                    name: "Edit",
                                    icon: <Pencil className="w-4 h-4" />,
                                    handler: () => {
                                        onEdit(department);
                                    },
                                },
                                {
                                    name: "Delete",
                                    icon: (
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    ),
                                    handler: () => {
                                        onDelete(department);
                                    },
                                },
                            ]}
                        />
                    )}
                </TableCell>
            </TableRow>
        </>
    ));
}

export default Departments;
