import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Search, Shield, Users } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Department Heads', href: '/dept-heads' },
];

interface DeptHead {
    id: number;
    department_id: number;
    department_name: string;
    employee_id: string;
    employee_name: string;
}

interface Department {
    id: number;
    dept_name: string;
}

interface Employee {
    employee_id: string;
    name: string;
    designation: string | null;
    department: string | null;
}

interface Props {
    deptHeads: DeptHead[];
    departments: Department[];
    employees: Employee[];
}

export default function DeptHeads({ deptHeads, departments, employees }: Props) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingHead, setEditingHead] = useState<DeptHead | null>(null);
    const [searchDept, setSearchDept] = useState('');
    const [searchEmp, setSearchEmp] = useState('');
    const [employeeSearch, setEmployeeSearch] = useState('');
    const [showEmployeeDropdown, setShowEmployeeDropdown] = useState(false);

    const addForm = useForm({
        department_id: '',
        employee_id: '',
    });

    const editForm = useForm({
        department_id: '',
        employee_id: '',
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        addForm.post(route('dept-heads.store'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Department head added successfully.');
                setShowAddModal(false);
                addForm.reset();
                setEmployeeSearch('');
            },
            onError: (errors: any) => {
                if (errors.duplicate) toast.error(errors.duplicate);
                else toast.error('Failed to add department head.');
            },
        });
    };

    const handleEdit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingHead) return;
        editForm.put(route('dept-heads.update', editingHead.id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Department head updated successfully.');
                setEditingHead(null);
                editForm.reset();
            },
            onError: (errors: any) => {
                if (errors.duplicate) toast.error(errors.duplicate);
                else toast.error('Failed to update department head.');
            },
        });
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to remove this department head?')) return;
        router.delete(route('dept-heads.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Department head removed.'),
            onError: () => toast.error('Failed to remove department head.'),
        });
    };

    const openEdit = (head: DeptHead) => {
        setEditingHead(head);
        editForm.setData({
            department_id: String(head.department_id),
            employee_id: head.employee_id,
        });
    };

    // Group heads by department
    const grouped = departments
        .map((dept) => ({
            ...dept,
            heads: deptHeads.filter((h) => h.department_id === dept.id),
        }))
        .filter((dept) => dept.heads.length > 0 || searchDept === '')
        .filter((dept) =>
            dept.dept_name.toLowerCase().includes(searchDept.toLowerCase())
        );

    // Filter employees for the add modal dropdown
    const filteredEmployees = employees.filter((emp) =>
        `${emp.employee_id} ${emp.name} ${emp.department ?? ''}`
            .toLowerCase()
            .includes(employeeSearch.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Department Heads" />
            <div className="flex h-full flex-1 flex-col gap-6 p-4 md:p-6">
                {/* Header */}
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Shield className="h-6 w-6 text-indigo-500" />
                            Department Heads Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Assign one or more heads to each department. A head gains access to attendance, leave, and store approvals for their department.
                        </p>
                    </div>
                    <button
                        onClick={() => { setShowAddModal(true); addForm.reset(); setEmployeeSearch(''); }}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        Add Head
                    </button>
                </div>

                {/* Search Filter */}
                <div className="relative max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search departments..."
                        value={searchDept}
                        onChange={(e) => setSearchDept(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
                    />
                </div>

                {/* Department cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {grouped.map((dept) => (
                        <div
                            key={dept.id}
                            className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <Users className="h-5 w-5 text-indigo-500" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {dept.dept_name}
                                </h3>
                                <span className="ml-auto text-xs font-medium rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 dark:bg-indigo-900 dark:text-indigo-300">
                                    {dept.heads.length} head{dept.heads.length !== 1 ? 's' : ''}
                                </span>
                            </div>

                            {dept.heads.length === 0 ? (
                                <p className="text-sm text-gray-400 italic">No head assigned</p>
                            ) : (
                                <ul className="space-y-2">
                                    {dept.heads.map((head) => (
                                        <li
                                            key={head.id}
                                            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700/50"
                                        >
                                            <div>
                                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                                    {head.employee_name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    ID: {head.employee_id}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={() => openEdit(head)}
                                                    className="rounded p-1.5 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/40 transition-colors"
                                                    title="Edit"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(head.id)}
                                                    className="rounded p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/40 transition-colors"
                                                    title="Remove"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    ))}
                </div>

                {grouped.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <Shield className="h-12 w-12 text-gray-300 mb-3" />
                        <p className="text-gray-500 dark:text-gray-400">
                            No departments found matching your search.
                        </p>
                    </div>
                )}

                {/* Summary */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Summary</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Department</th>
                                    <th className="text-left py-2 px-3 font-medium text-gray-500 dark:text-gray-400">Head(s)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments
                                    .filter((d) => deptHeads.some((h) => h.department_id === d.id))
                                    .map((dept) => (
                                        <tr key={dept.id} className="border-b border-gray-100 dark:border-gray-700/50">
                                            <td className="py-2 px-3 text-gray-800 dark:text-gray-200">{dept.dept_name}</td>
                                            <td className="py-2 px-3 text-gray-600 dark:text-gray-400">
                                                {deptHeads
                                                    .filter((h) => h.department_id === dept.id)
                                                    .map((h) => h.employee_name)
                                                    .join(', ')}
                                            </td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Add Department Head
                        </h3>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Department
                                </label>
                                <select
                                    value={addForm.data.department_id}
                                    onChange={(e) => addForm.setData('department_id', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    <option value="">Select department...</option>
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.dept_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="relative">
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Employee
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search employee by ID or name..."
                                    value={employeeSearch}
                                    onChange={(e) => {
                                        setEmployeeSearch(e.target.value);
                                        setShowEmployeeDropdown(true);
                                        addForm.setData('employee_id', '');
                                    }}
                                    onFocus={() => setShowEmployeeDropdown(true)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                {addForm.data.employee_id && (
                                    <p className="mt-1 text-xs text-green-600 dark:text-green-400">
                                        ✓ Selected: {employees.find((e) => e.employee_id === addForm.data.employee_id)?.name} ({addForm.data.employee_id})
                                    </p>
                                )}
                                {showEmployeeDropdown && employeeSearch.length > 0 && (
                                    <div className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-600 dark:bg-gray-700">
                                        {filteredEmployees.slice(0, 20).map((emp) => (
                                            <button
                                                key={emp.employee_id}
                                                type="button"
                                                onClick={() => {
                                                    addForm.setData('employee_id', emp.employee_id);
                                                    setEmployeeSearch(emp.name);
                                                    setShowEmployeeDropdown(false);
                                                }}
                                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                                            >
                                                <span className="text-gray-800 dark:text-gray-200">
                                                    {emp.name}
                                                </span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                                    {emp.employee_id} · {emp.department ?? ''}
                                                </span>
                                            </button>
                                        ))}
                                        {filteredEmployees.length === 0 && (
                                            <p className="px-3 py-2 text-sm text-gray-400">No employees found</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={addForm.processing || !addForm.data.employee_id}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {addForm.processing ? 'Adding...' : 'Add Head'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {editingHead && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-800">
                        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
                            Edit Department Head
                        </h3>
                        <form onSubmit={handleEdit} className="space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Department
                                </label>
                                <select
                                    value={editForm.data.department_id}
                                    onChange={(e) => editForm.setData('department_id', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    {departments.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.dept_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Employee
                                </label>
                                <select
                                    value={editForm.data.employee_id}
                                    onChange={(e) => editForm.setData('employee_id', e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                >
                                    {employees.map((e) => (
                                        <option key={e.employee_id} value={e.employee_id}>
                                            {e.name} ({e.employee_id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditingHead(null)}
                                    className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editForm.processing}
                                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
                                >
                                    {editForm.processing ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
