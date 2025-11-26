import { useMemo, useState } from "react";
import axios from "axios";
import AttendanceCalendar from "@/components/AttendanceCalendar";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";
import { LoaderCircle } from "lucide-react";

type ReportRow = {
    employee_id: number | string;
    name: string;
    designation: string | null;
    in_time: string;  // "HH:mm:ss" or "Absent"
    out_time: string; // "HH:mm:ss" or ""
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
    { title: "Department Attendance", href: "/dept-head/attendance" },
];

const OFFICE_START = "08:00:00"; // keep in sync with backend rule

function toMinutes(t?: string | null): number | null {
    if (!t) return null;
    if (t === "Absent") return null;
    const parts = t.split(":").map(Number);
    if (parts.some((n) => Number.isNaN(n))) return null;
    const [h, m, s = 0] = parts;
    return h * 60 + m + Math.floor(s / 60);
}

function fmtHHMM(totalMin: number): string {
    const hh = String(Math.floor(totalMin / 60)).padStart(2, "0");
    const mm = String(totalMin % 60).padStart(2, "0");
    return `${hh}:${mm}`;
}

export default function Attendance({ date, report, department }: Props) {
    const [modalOpen, setModalOpen] = useState(false);
    const [employeeData, setEmployeeData] = useState<any>(null);
    const [selectedEmp, setSelectedEmp] = useState<ReportRow | null>(null);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    console.log("HUDAI");
    const openEmployeeModal = async (emp: ReportRow) => {
        try {
            setLoading(true);
            const res = await axios.get(route("dept.employee.monthly", emp.employee_id));
            setEmployeeData(res.data);
            setSelectedEmp(emp);
            setModalOpen(true);
        } catch (e) {
            console.error("Error fetching employee monthly data", e);
        } finally {
            setLoading(false);
        }
    };

    // Search filter (ID or Name)
    const filteredReport = useMemo(() => {
        const q = searchTerm.toLowerCase().trim();
        if (!q) return report;
        return report.filter(
            (emp) =>
                emp.employee_id.toString().includes(q) ||
                emp.name.toLowerCase().includes(q)
        );
    }, [report, searchTerm]);

    // parse HH:MM:SS into seconds
    const parseTime = (time?: string | null): number | null => {
        if (!time || time === "Absent") return null;
        const [h, m, s = "0"] = time.split(":");
        return Number(h) * 3600 + Number(m) * 60 + Number(s);
    };

// compute late employees
    const lateEmployees = report
        .map((emp) => {
            const officeStart = emp.allowed_entry || OFFICE_START; // fallback if no allowance
            const officeStartSec = parseTime(officeStart)!;
            const inTimeSec = parseTime(emp.in_time);

            if (inTimeSec === null) return null; // absent, skip here

            // if arrived after officeStart but before allowed_entry => not late
            if (inTimeSec <= officeStartSec) return null;

            const lateBySec = inTimeSec - officeStartSec;
            const hh = String(Math.floor(lateBySec / 3600)).padStart(2, "0");
            const mm = String(Math.floor((lateBySec % 3600) / 60)).padStart(2, "0");
            const ss = String(lateBySec % 60).padStart(2, "0");

            return { ...emp, late_by: `${hh}:${mm}:${ss}` };
        })
        .filter(Boolean) as (ReportRow & { late_by: string })[];


    const getNowSeconds = () => {
        const now = new Date();
        return now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
    };

    const absentEmployees = useMemo(() => {
        const nowSec = getNowSeconds();

        return report.filter((emp) => {
            if (emp.in_time) return false; // they already entered

            const officeStart = emp.allowed_entry || OFFICE_START;
            const officeStartSec = parseTime(officeStart)!;

            // If current time is still before allowed_entry → not absent yet
            if (nowSec < officeStartSec) return false;

            // No in_time and already past allowed_entry → absent
            return true;
        });
    }, [report]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">
                    {department.name}
                </h1>
                <h1 className="text-xl font-bold mb-6">
                    Date: - {date}
                </h1>

                {/* Summary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Late Employees */}
                    <div className="bg-white shadow rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-3">
                            Late Employees ({lateEmployees.length})
                        </h2>
                        {lateEmployees.length > 0 ? (
                            <table className="w-full border-collapse border border-gray-300 text-sm">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-1">ID</th>
                                    <th className="border px-2 py-1">Name</th>
                                    <th className="border px-2 py-1">Designation</th>
                                    <th className="border px-2 py-1">In Time</th>
                                    <th className="border px-2 py-1">Late By</th>
                                </tr>
                                </thead>
                                <tbody>
                                {lateEmployees.map((emp) => (
                                    <tr key={emp.employee_id} className="hover:bg-gray-50">
                                        <td className="border px-2 py-1">{emp.employee_id}</td>
                                        <td className="border px-2 py-1">{emp.name}</td>
                                        <td className="border px-2 py-1">{emp.designation}</td>
                                        <td className="border px-2 py-1">{emp.in_time}</td>
                                        <td className="border px-2 py-1 text-red-600 font-medium">
                                            {emp.late_by}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500">No late employees</p>
                        )}
                    </div>

                    {/* Absent Employees */}
                    <div className="bg-white shadow rounded-lg p-4">
                        <h2 className="text-lg font-semibold mb-3">
                            Absent Employees ({absentEmployees.length})
                        </h2>
                        {absentEmployees.length > 0 ? (
                            <table className="w-full border-collapse border border-gray-300 text-sm">
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

                {/* Search */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by ID or Name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* Full Attendance Table */}
                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-2 py-1">Employee ID</th>
                        <th className="border px-2 py-1">Name</th>
                        <th className="border px-2 py-1">Designation</th>
                        <th className="border px-2 py-1">In Time</th>
                        <th className="border px-2 py-1">Out Time</th>
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
                                <td className="border px-2 py-1">{emp.in_time}</td>
                                <td className="border px-2 py-1">{emp.out_time}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center py-4">
                                No records found
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>

                {/* Loader Overlay */}
                {loading && (
                    <div className="fixed inset-0 bg-black/50 flex flex-col items-center justify-center z-50">
                        <LoaderCircle className="w-12 h-12 animate-spin text-white" />
                        <span className="text-white mt-3 text-sm">
              Loading employee data...
            </span>
                    </div>
                )}

                {/* Modal */}
                {modalOpen && employeeData && !loading && selectedEmp && (
                    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">
                        <div className="bg-white rounded-xl p-6 max-w-7xl w-full shadow-lg overflow-y-auto max-h-[90vh]">
                            <h2 className="text-xl font-bold mb-4">
                                {selectedEmp.name} ({selectedEmp.employee_id}) -{" "}
                                {employeeData.month}/{employeeData.year}
                            </h2>

                            {/* Summary */}
                            <div className="mb-6">
                                <h3 className="font-semibold">Monthly Summary</h3>
                                <table className="w-full border-collapse">
                                    <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border px-2 py-1">Absences</th>
                                        <th className="border px-2 py-1">Late Entries</th>
                                        <th className="border px-2 py-1">Early Leaves</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td className="border px-2 py-1">{employeeData.summary.absence}</td>
                                        <td className="border px-2 py-1">{employeeData.summary.late}</td>
                                        <td className="border px-2 py-1">{employeeData.summary.early}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Calendar */}
                            <AttendanceCalendar
                                logs={employeeData.calendarLogs}
                                month={employeeData.month}
                                year={employeeData.year}
                            />

                            <button
                                onClick={() => setModalOpen(false)}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
