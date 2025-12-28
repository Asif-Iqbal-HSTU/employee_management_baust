import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { CircleCheck, CircleX } from 'lucide-react';
import { useState } from 'react';

export default function LeaveHead({ leaves, employees }: any) {
    const [showModal, setShowModal] = useState(false);
    const [medicalFile, setMedicalFile] = useState<string | null>(null);
    const [employeeLeaves, setEmployeeLeaves] = useState<any[]>([]);
    const [employeeModal, setEmployeeModal] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [empSearch, setEmpSearch] = useState('');

    const openEmployeeLeaves = async (emp: any) => {
        setSelectedEmployee(emp);

        const res = await fetch(route('deptHead.employee.leaves', emp.employee_id));

        const data = await res.json();
        setEmployeeLeaves(data);
        setEmployeeModal(true);
    };

    const approve = (id: number) => {
        router.post(`/dept-head/leaves/${id}/approve`);
    };

    const deny = (id: number) => {
        router.post(`/dept-head/leaves/${id}/deny`);
    };

    const filteredEmployees = employees.filter((emp: any) => emp.name.toLowerCase().includes(empSearch.toLowerCase()));

    return (
        <AppLayout>
            <Head title="Leave Requests - Department Head" />

            <div className="grid grid-cols-1 gap-6 p-6 lg:grid-cols-3">
                <div className="rounded-xl bg-white p-4 shadow lg:col-span-2">
                    <h2 className="mb-3 text-lg font-bold">Pending Leave Requests</h2>

                    <table className="w-full border text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2">Employee</th>
                                <th className="border p-2">Type</th>
                                <th className="border p-2">Dates</th>
                                <th className="border p-2">Reason</th>
                                <th className="border p-2">Replacement</th>
                                <th className="border p-2">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaves.map((leave: any) => (
                                <tr key={leave.id}>
                                    <td className="border p-2">
                                        {leave.name}
                                        <br />
                                        <span className="text-xs text-gray-500">{leave.designation}</span>
                                    </td>

                                    <td className="border p-2">
                                        {leave.type === 'Medical Leave' && leave.medical_file ? (
                                            <button
                                                onClick={() => {
                                                    setMedicalFile(`/storage/${leave.medical_file}`);
                                                    setShowModal(true);
                                                }}
                                                className="text-blue-600 underline"
                                            >
                                                Medical
                                            </button>
                                        ) : (
                                            leave.type
                                        )}
                                    </td>

                                    <td className="border p-2">
                                        {leave.start_date} → {leave.end_date}
                                    </td>

                                    <td className="border p-2">{leave.reason}</td>

                                    <td className="border p-2">{leave.replacement_name ?? '—'}</td>

                                    <td className="border p-2 text-center">
                                        <div className="flex justify-center gap-2">
                                            {/* Approve Button */}
                                            <div className="group relative">
                                                <button onClick={() => approve(leave.id)} className="text-green-600">
                                                    <CircleCheck size={20} />
                                                </button>
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                    Approve
                                                </span>
                                            </div>

                                            {/* Deny Button */}
                                            <div className="group relative">
                                                <button onClick={() => deny(leave.id)} className="text-red-600">
                                                    <CircleX size={20} />
                                                </button>
                                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                                                    Deny
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="rounded-xl bg-white p-4 shadow">
                    <h2 className="mb-3 text-lg font-bold">Leave Register</h2>

                    {/* 🔍 Search */}
                    <div className="relative mb-3">
                        <input
                            type="text"
                            placeholder="Search employee..."
                            value={empSearch}
                            onChange={(e) => setEmpSearch(e.target.value)}
                            className="w-full rounded border px-3 py-2 pr-9 text-sm focus:ring focus:ring-indigo-200 focus:outline-none"
                        />

                        {empSearch && (
                            <button
                                type="button"
                                onClick={() => setEmpSearch('')}
                                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                                aria-label="Clear search"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    {/* 👇 Scrollable list (5 visible) */}
                    <div className="max-h-[320px] overflow-y-auto">
                        <ul className="divide-y">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map((emp: any) => (
                                    <li
                                        key={emp.employee_id}
                                        onClick={() => openEmployeeLeaves(emp)}
                                        className="cursor-pointer p-3 hover:bg-gray-100"
                                    >
                                        <p className="font-medium">{emp.name}</p>
                                        <p className="text-xs text-gray-500">{emp.designation}</p>
                                    </li>
                                ))
                            ) : (
                                <li className="p-3 text-sm text-gray-500">No employees found</li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>

            {showModal && medicalFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="max-h-[90vh] w-[90%] max-w-4xl overflow-hidden rounded-xl bg-white shadow-lg">
                        {/* Header */}
                        <div className="flex items-center justify-between border-b p-4">
                            <h2 className="text-lg font-semibold">Medical Certificate</h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setMedicalFile(null);
                                }}
                                className="text-xl text-gray-500 hover:text-black"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Body */}
                        <div className="h-[80vh] overflow-auto p-4">
                            {medicalFile.endsWith('.pdf') ? (
                                <iframe src={medicalFile} className="h-full w-full rounded border" />
                            ) : (
                                <img src={medicalFile} alt="Medical Certificate" className="mx-auto max-w-full" />
                            )}
                        </div>
                    </div>
                </div>
            )}

            {employeeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-[90%] max-w-5xl rounded-xl bg-white p-6">
                        <h2 className="mb-4 text-lg font-bold">Leave History – {selectedEmployee?.name}</h2>

                        <table className="w-full border text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border p-2">Type</th>
                                    <th className="border p-2">Start</th>
                                    <th className="border p-2">End</th>
                                    <th className="border p-2">Days</th>
                                    <th className="border p-2">Replacement</th>
                                    <th className="border p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employeeLeaves.map((l, i) => (
                                    <tr key={i}>
                                        <td className="border p-2">{l.type}</td>
                                        <td className="border p-2">{l.start_date}</td>
                                        <td className="border p-2">{l.end_date}</td>
                                        <td className="border p-2">{l.days}</td>
                                        <td className="border p-2">{l.replace ?? '—'}</td>
                                        <td className="border p-2">{l.status}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="mt-4 text-right">
                            <button onClick={() => setEmployeeModal(false)} className="rounded bg-gray-200 px-4 py-2">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
