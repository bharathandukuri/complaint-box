import { useGetUsers } from "@/api/user";
import { useGetAllDepartments } from "@/api/department";
import OptionsButton from "@/components/options-button";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "@/components/ui/input-group";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import type { User } from "@/types/user";
import {
    BookA,
    Loader2,
    Pencil,
    Search,
    Trash2,
    UserCircle2,
    UserIcon,
} from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserDialog from "./user-form-dialog";
import DeleteUserDialog from "./delete-user-dialog";
import MentorAssignmentsDialog from "./mentor-assignments-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function Users() {
    const navigate = useNavigate();

    const {
        data: departments,
        isLoading: isDepartmentsLoading,
        error: departmentsError,
        refetch: refetchDepartments,
    } = useGetAllDepartments();

    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

    useEffect(() => {
        const id = setTimeout(() => setDebouncedSearchTerm(searchTerm), 300);
        return () => clearTimeout(id);
    }, [searchTerm]);

    const [searchProperty, setSearchProperty] = useState("NAME");
    const [role, setRole] = useState("ALL");
    const [academicYear, setAcademicYear] = useState("");
    const [department, setDepartment] = useState("ALL");
    const [section, setSection] = useState("ALL");
    const [size, setSize] = useState("20");

    const {
        data: infiniteData,
        isLoading: isUsersLoading,
        error: usersError,
        refetch: refetchUsers,
        fetchNextPage: fetchNextUsers,
        hasNextPage: hasNextUsers,
        isFetchingNextPage: isFetchingNextUsers,
    } = useGetUsers({
        searchKey: debouncedSearchTerm,
        searchProperty: searchProperty,
        role: role,
        academicYear: academicYear,
        department: department,
        section: section,
        size: size,
    });

    const sentinelRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                const entry = entries[0];
                if (
                    entry.isIntersecting &&
                    hasNextUsers &&
                    !isFetchingNextUsers
                ) {
                    fetchNextUsers();
                }
            },
            { root: null, rootMargin: "400px", threshold: 0.01 },
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [hasNextUsers, isFetchingNextUsers, fetchNextUsers, infiniteData, size]);

    useEffect(() => {
        if (section === "ALL") {
            setSection("ALL");
            return;
        }

        if (department === "ALL") {
            setSection("ALL");
            return;
        }

        const validSections =
            departments
                ?.find((d) => d.code === department)
                ?.sections.map((s) => s.name) ?? [];

        if (!validSections.includes(section)) {
            setSection("ALL");
        }
    }, [department, departments, section]);

    const users = useMemo(() => {
        return infiniteData?.pages.flat() ?? [];
    }, [infiniteData]);

    const [selected, setSelected] = useState<User | null>(null);
    const [editDialog, setEditDialog] = useState(false);
    const [deleteDialog, setDeleteDialog] = useState(false);
    const [mentorAssignmentsDialog, setMentorAssignmentsDialog] =
        useState(false);

    function handleEdit(user: User) {
        setSelected(user);
        setEditDialog(true);
    }

    function handleDelete(user: User) {
        setSelected(user);
        setDeleteDialog(true);
    }

    function handleMentorAssignments(user: User) {
        setSelected(user);
        setMentorAssignmentsDialog(true);
    }

    if (isDepartmentsLoading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                <span className="text-gray-500">Loading departments...</span>
            </div>
        );
    }

    if (departmentsError) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-2 space-y-2">
                <span className="text-red-500 flex items-center flex-col gap-2">
                    <span>Failed to load departments</span>
                    <span>
                        {departmentsError.response?.data.message ??
                            departmentsError.message}
                    </span>
                </span>
                <Button onClick={() => refetchDepartments()}>Retry</Button>
            </div>
        );
    }

    if (departments && !departments?.length) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-4">
                <span className="text-red-500">
                    No departments found. Please add a department first.
                </span>
                <Button onClick={() => navigate("/admin/department")}>
                    Add Department
                </Button>
            </div>
        );
    }
    return (
        <div className="flex flex-col p-5 space-y-5">
            <UserDialog
                departments={departments ?? []}
                type="edit"
                openDialog={editDialog}
                setOpenDialog={setEditDialog}
                user={selected}
                setUser={setSelected}
            />

            <DeleteUserDialog
                open={deleteDialog}
                setOpen={setDeleteDialog}
                setUser={setSelected}
                user={selected}
            />

            <MentorAssignmentsDialog
                open={mentorAssignmentsDialog}
                setOpen={setMentorAssignmentsDialog}
                user={selected}
                setUser={setSelected}
                departments={departments}
            />

            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold font-poppins">Users</h1>
                <UserDialog departments={departments ?? []} type="add" />
            </div>

            <Card className="p-4 flex gap-1">
                <div className="flex flex-col md:flex-row items-center gap-4">
                    <InputGroup className="flex-1 w-full">
                        <InputGroupAddon>
                            <Search className="h-4 w-4 text-muted-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => {
                                setSearchTerm(e.target.value);
                            }}
                        />
                    </InputGroup>

                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Search by:
                        </span>
                        <Select
                            value={searchProperty}
                            onValueChange={(e) => setSearchProperty(e)}
                        >
                            <SelectTrigger className="w-[150px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="NAME">Name</SelectItem>
                                <SelectItem value="USERNAME">
                                    Username
                                </SelectItem>
                                <SelectItem value="EMAIL">Email</SelectItem>
                                <SelectItem value="ROLLNUMBER">
                                    Roll Number
                                </SelectItem>
                                <SelectItem value="EMPLOYEEID">
                                    Employee ID
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-4 mt-4 flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground">
                        Role:
                    </span>
                    <Select value={role} onValueChange={(e) => setRole(e)}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All roles</SelectItem>
                            <SelectItem value="STUDENT">Student</SelectItem>
                            <SelectItem value="MENTOR">Mentor</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                        </SelectContent>
                    </Select>

                    {role === "STUDENT" && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-muted-foreground">
                                Academic Year:
                            </span>
                            <Input
                                placeholder="YYYY-YYYY"
                                className="w-[120px]"
                                value={academicYear}
                                onChange={(e) =>
                                    setAcademicYear(e.target.value)
                                }
                            />
                        </div>
                    )}

                    <span className="text-sm font-medium text-muted-foreground">
                        Department:
                    </span>
                    <Select value={department} onValueChange={setDepartment}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All departments</SelectItem>
                            {departments?.map((dept) => (
                                <SelectItem key={dept.code} value={dept.code}>
                                    {dept.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {department !== "ALL" && (
                        <>
                            <span className="text-sm font-medium text-muted-foreground">
                                Section:
                            </span>
                            <Select value={section} onValueChange={setSection}>
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">
                                        All sections
                                    </SelectItem>
                                    {departments
                                        ?.find((d) => d.code === department)
                                        ?.sections.map((sec) => (
                                            <SelectItem
                                                key={sec.name}
                                                value={sec.name}
                                            >
                                                {sec.name}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </>
                    )}

                    <span className="text-sm font-medium text-muted-foreground">
                        Size:
                    </span>
                    <Select value={size} onValueChange={setSize}>
                        <SelectTrigger className="w-[100px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            <Table>
                <TableHeader className="bg-primary">
                    <TableRow className="hover:bg-primary">
                        <TableHead className="text-primary-foreground font-bold">
                            ID
                        </TableHead>
                        <TableHead className="text-primary-foreground font-bold">
                            NAME
                        </TableHead>
                        <TableHead className="text-primary-foreground font-bold">
                            USERNAME/EMAIL
                        </TableHead>
                        <TableHead className="text-primary-foreground font-bold">
                            ROLE
                        </TableHead>
                        <TableHead className="text-primary-foreground font-bold">
                            DEPT/ID
                        </TableHead>
                        <TableHead className="text-primary-foreground font-bold text-right">
                            ACTIONS
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="bg-secondary">
                    {isUsersLoading ? (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="py-10 text-center"
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="animate-spin" />
                                    Loading users...
                                </div>
                            </TableCell>
                        </TableRow>
                    ) : usersError ? (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="py-10 text-center text-red-500 space-y-4"
                            >
                                <div>{usersError.message}</div>
                                <Button onClick={() => refetchUsers()}>
                                    Retry
                                </Button>
                            </TableCell>
                        </TableRow>
                    ) : users.length === 0 ? (
                        <TableRow>
                            <TableCell
                                colSpan={6}
                                className="py-12 text-center text-muted-foreground"
                            >
                                No users found.
                            </TableCell>
                        </TableRow>
                    ) : (
                        <>
                            {users.map((user: User) => (
                                <MemoizedUserRow
                                    key={user.id}
                                    user={user}
                                    onEdit={handleEdit}
                                    onDelete={handleDelete}
                                    onMentorAssignments={
                                        handleMentorAssignments
                                    }
                                />
                            ))}
                            {users.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="py-6">
                                        <div
                                            ref={sentinelRef}
                                            className="flex items-center justify-center"
                                        >
                                            {isFetchingNextUsers ? (
                                                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                                    <Loader2 className="animate-spin w-4 h-4" />
                                                    Loading more…
                                                </div>
                                            ) : hasNextUsers ? (
                                                <div className="h-4" />
                                            ) : (
                                                <span className="text-sm text-muted-foreground">
                                                    No more results
                                                </span>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}

const UserRow = ({
    user,
    onEdit,
    onDelete,
    onMentorAssignments,
}: {
    user: User;
    onEdit: (user: User) => void;
    onDelete: (user: User) => void;
    onMentorAssignments: (user: User) => void;
}) => {
    const userOptions = [
        {
            name: "Edit",
            icon: <Pencil className="w-4 h-4" />,
            handler: () => {
                onEdit(user);
            },
        },
        {
            name: "Delete",
            icon: <Trash2 className="w-4 h-4 text-red-500" />,
            handler: () => {
                onDelete(user);
            },
        },
    ];

    if (user.role === "MENTOR") {
        userOptions.push({
            name: "Mentor Assignments",
            icon: <BookA className="w-4 h-4" />,
            handler: () => {
                onMentorAssignments(user);
            },
        });
    }
    return (
        <TableRow key={user.id}>
            <TableCell>{user.id}</TableCell>
            <TableCell className="flex items-center gap-2">
                {user.profilePic ? (
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={user.profilePic} alt={user.name} />
                        <AvatarFallback>
                            {user.name ? (
                                user.name.charAt(0).toUpperCase()
                            ) : (
                                <UserIcon className="h-4 w-4" />
                            )}
                        </AvatarFallback>
                    </Avatar>
                ) : (
                    <UserCircle2 className="w-8 h-8 text-muted-foreground" />
                )}
                <span>{user.name}</span>
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <span>{user.username}</span>
                    <span className="text-xs text-muted-foreground">
                        {user.email}
                    </span>
                </div>
            </TableCell>
            <TableCell>
                <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold truncate
                        ${
                            user.role === "ADMIN"
                                ? "bg-red-100/10 text-red-600"
                                : user.role === "MENTOR"
                                  ? "bg-blue-100/10 text-blue-600"
                                  : user.role === "STUDENT"
                                    ? "bg-green-100/10 text-green-600"
                                    : "bg-gray-100/10 text-gray-600"
                        }`}
                >
                    {user.role}
                </span>
            </TableCell>
            <TableCell>
                <div className="flex flex-col">
                    <span>
                        {user.studentDetails?.department &&
                        user.studentDetails?.section
                            ? `${user.studentDetails.department}-${user.studentDetails.section}`
                            : user.mentorDetails?.department &&
                                user.mentorDetails?.section
                              ? `${user.mentorDetails.department}-${user.mentorDetails.section}`
                              : "N/A"}
                    </span>

                    <span className="text-xs text-muted-foreground">
                        {user.studentDetails?.rollNumber ||
                            user.mentorDetails?.employeeID ||
                            "N/A"}
                    </span>
                </div>
            </TableCell>
            <TableCell className="text-right">
                <OptionsButton loading={false} options={userOptions} />
            </TableCell>
        </TableRow>
    );
};

const MemoizedUserRow = memo(UserRow);

export default Users;
