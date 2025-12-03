import AttendanceCalendar from '@/components/AttendanceCalendar';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useMemo, useState } from 'react';
import { LoaderCircle } from 'lucide-react';
import EmployeeCalendarModal from "@/Components/EmployeeCalendarModal";

type ReportRow = {
    employee_id: number | string;
    name: string;
    designation: string | null;
    in_time: string | null;
    out_time: string | null;
    status: string | null;
    allowed_entry?: string | null;
};

type Props = {
    date: string;
    report: ReportRow[];
    department: {
        id: number;
        name: string;
    };
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Department Attendance', href: '/dept-head/attendance' }
];

export default function Attendance({ date, report, department }: Props) {
    // const [modalOpen, setModalOpen] = useState(false);
    const [employeeData, setEmployeeData] = useState<any>(null);
    const [selectedEmp, setSelectedEmp] = useState<ReportRow | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    const openEmployeeModal = (emp) => {
        setSelectedEmployee(emp);
        setModalOpen(true);
    };

    /*const openEmployeeModal = async (emp: ReportRow) => {
        try {
            setLoading(true);
            const res = await axios.get(route('dept.employee.monthly', { employeeId: emp.employee_id }));
            setEmployeeData(res.data);
            setSelectedEmp(emp);
            setModalOpen(true);
        } catch (e) {
            console.error('Error fetching employee monthly data', e);
        } finally {
            setLoading(false);
        }
    };*/

    // ------- SEARCH ----------
    const filteredReport = useMemo(() => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return report;

        return report.filter(
            (emp) =>
                emp.employee_id.toString().includes(q) ||
                emp.name.toLowerCase().includes(q)
        );
    }, [report, searchTerm]);

    // ------- ATTENDANCE GROUPS USING DAILY ATTENDANCE TABLE ---------

    const lateEmployees = report.filter((emp) =>
        emp.status && emp.status.includes('late entry')
    );

    const earlyEmployees = report.filter((emp) =>
        emp.status && emp.status.includes('early leave')
    );

    const absentEmployees = report.filter((emp) => emp.in_time === null);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Department Attendance" />

            <div className="p-6">
                <h1 className="mb-2 text-2xl font-bold">{department.name}</h1>
                <h2 className="mb-6 text-xl font-bold">Date: {date}</h2>

                {/* ----------- SUMMARY ----------- */}
                <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* LATE EMPLOYEES */}
                    <div className="rounded-lg bg-white p-4 shadow">
                        <h2 className="mb-3 text-lg font-semibold">
                            Late Employees ({lateEmployees.length})
                        </h2>
                        {lateEmployees.length > 0 ? (
                            <table className="w-full border border-gray-300 text-sm">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-1">ID</th>
                                    <th className="border px-2 py-1">Name</th>
                                    <th className="border px-2 py-1">In Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {lateEmployees.map((emp) => (
                                    <tr key={emp.employee_id} className="hover:bg-gray-50">
                                        <td className="border px-2 py-1">{emp.employee_id}</td>
                                        <td className="border px-2 py-1">{emp.name}</td>
                                        <td className="border px-2 py-1">{emp.in_time}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500">No late employees</p>
                        )}
                    </div>

                    {/* EARLY LEAVE EMPLOYEES */}
                    {/*<div className="rounded-lg bg-white p-4 shadow">
                        <h2 className="mb-3 text-lg font-semibold">
                            Early Leave ({earlyEmployees.length})
                        </h2>
                        {earlyEmployees.length > 0 ? (
                            <table className="w-full border border-gray-300 text-sm">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-1">ID</th>
                                    <th className="border px-2 py-1">Name</th>
                                    <th className="border px-2 py-1">Out Time</th>
                                </tr>
                                </thead>
                                <tbody>
                                {earlyEmployees.map((emp) => (
                                    <tr key={emp.employee_id} className="hover:bg-gray-50">
                                        <td className="border px-2 py-1">{emp.employee_id}</td>
                                        <td className="border px-2 py-1">{emp.name}</td>
                                        <td className="border px-2 py-1">{emp.out_time}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500">No early leave cases</p>
                        )}
                    </div>*/}

                    {/* ABSENT EMPLOYEES */}
                    <div className="rounded-lg bg-white p-4 shadow">
                        <h2 className="mb-3 text-lg font-semibold">
                            Absent Employees ({absentEmployees.length})
                        </h2>
                        {absentEmployees.length > 0 ? (
                            <table className="w-full border border-gray-300 text-sm">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-1">ID</th>
                                    <th className="border px-2 py-1">Name</th>
                                    <th className="border px-2 py-1">Designation</th>
                                </tr>
                                </thead>
                                <tbody>
                                {absentEmployees.map((emp) => (
                                    <tr key={emp.employee_id} className="hover:bg-gray-50">
                                        <td className="border px-2 py-1">{emp.employee_id}</td>
                                        <td className="border px-2 py-1">{emp.name}</td>
                                        <td className="border px-2 py-1">{emp.designation}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500">No absent employees</p>
                        )}
                    </div>
                </div>

                {/* ---------- SEARCH ---------- */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by ID or Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-64 rounded-lg border px-3 py-2 focus:ring-2 focus:ring-blue-400 focus:outline-none"
                    />
                </div>

                {/* ----------- FULL TABLE ----------- */}
                <table className="w-full border border-gray-300">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-2 py-1">Employee ID</th>
                        <th className="border px-2 py-1">Name</th>
                        <th className="border px-2 py-1">Designation</th>
                        <th className="border px-2 py-1">In Time</th>
                        <th className="border px-2 py-1">Out Time</th>
                        {/*<th className="border px-2 py-1">Status</th>*/}
                    </tr>
                    </thead>
                    <tbody>
                    {filteredReport.length > 0 ? (
                        filteredReport.map((emp) => (
                            <tr
                                key={emp.employee_id}
                                onClick={() => openEmployeeModal(emp)}
                                className="cursor-pointer hover:bg-blue-50"
                            >
                                <td className="border px-2 py-1">{emp.employee_id}</td>
                                <td className="border px-2 py-1">{emp.name}</td>
                                <td className="border px-2 py-1">{emp.designation}</td>
                                <td className="border px-2 py-1">{emp.in_time ?? '—'}</td>
                                <td className="border px-2 py-1">{emp.out_time ?? '—'}</td>
                                {/*<td className="border px-2 py-1">{emp.status ?? '—'}</td>*/}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={6} className="py-4 text-center">
                                No records found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>

                <EmployeeCalendarModal
                    employee={selectedEmployee}
                    isOpen={modalOpen}
                    onClose={() => setModalOpen(false)}
                />
            </div>
        </AppLayout>
    );
}
