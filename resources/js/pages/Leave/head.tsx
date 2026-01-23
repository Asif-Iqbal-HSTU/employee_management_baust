import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { CircleCheck, CircleX, Calendar, Users, ClipboardList, UserCheck, Search, X } from 'lucide-react';
import { useState } from 'react';

export default function LeaveHead({ leaves, employees, onLeaveToday, today }: any) {
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

    const approveCancel = (id: number) => {
        if (confirm('Approve cancellation? This will delete the leave and attendance records.')) {
            router.post(route('deptHead.leaves.approve-cancel', id));
        }
    };

    const denyCancel = (id: number) => {
        if (confirm('Deny cancellation? The leave will remain active.')) {
            router.post(route('deptHead.leaves.deny-cancel', id));
        }
    };

    const filteredEmployees = employees.filter((emp: any) =>
        emp.name.toLowerCase().includes(empSearch.toLowerCase())
    );

    // Helper functions
    const getRelevantBalance = (leave: any) => {
        switch (leave.type) {
            case 'Casual Leave':
                return { remaining: leave.remaining_casual, label: 'Casual' };
            case 'Medical Leave':
                return { remaining: leave.remaining_medical, label: 'Medical' };
            case 'Earned Leave':
                return { remaining: leave.remaining_earned, label: 'Earned' };
            default:
                return null;
        }
    };

    const getBalanceColor = (remaining: number) => {
        if (remaining <= 0) return 'bg-red-100 text-red-700 border-red-200';
        if (remaining <= 5) return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    };

    const getLeaveTypeColor = (type: string) => {
        switch (type) {
            case 'Casual Leave':
                return 'bg-blue-100 text-blue-700';
            case 'Medical Leave':
                return 'bg-rose-100 text-rose-700';
            case 'Earned Leave':
                return 'bg-violet-100 text-violet-700';
            case 'Duty Leave':
                return 'bg-teal-100 text-teal-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <AppLayout>
            <Head title="Leave Requests - Department Head" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
                    <p className="text-gray-500">Review and manage leave requests for your department</p>
                </div>

                {/* Stats Cards */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-amber-500 p-2.5 text-white shadow-lg shadow-amber-200">
                                <ClipboardList size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-amber-700">{leaves.length}</p>
                                <p className="text-sm text-amber-600">Pending Requests</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-rose-500 p-2.5 text-white shadow-lg shadow-rose-200">
                                <Calendar size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-rose-700">{onLeaveToday?.length || 0}</p>
                                <p className="text-sm text-rose-600">On Leave Today</p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-indigo-500 p-2.5 text-white shadow-lg shadow-indigo-200">
                                <Users size={20} />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-indigo-700">{employees.length}</p>
                                <p className="text-sm text-indigo-600">Total Employees</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Pending Leave Requests */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-100/50 lg:col-span-2">
                        <div className="mb-4 flex items-center gap-2">
                            <div className="rounded-lg bg-amber-100 p-2">
                                <ClipboardList size={18} className="text-amber-600" />
                            </div>
                            <h2 className="text-lg font-bold text-gray-800">Pending Leave Requests</h2>
                        </div>

                        {leaves.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <UserCheck size={48} className="mb-3 opacity-50" />
                                <p className="text-lg font-medium">No pending requests</p>
                                <p className="text-sm">All caught up!</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-gray-100 bg-gray-50/50">
                                            <th className="p-3 text-left font-semibold text-gray-600">Employee</th>
                                            <th className="p-3 text-left font-semibold text-gray-600">Type</th>
                                            <th className="p-3 text-left font-semibold text-gray-600">Duration</th>
                                            <th className="p-3 text-left font-semibold text-gray-600">Balance</th>
                                            <th className="p-3 text-left font-semibold text-gray-600">Reason</th>
                                            <th className="p-3 text-center font-semibold text-gray-600">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {leaves.map((leave: any) => {
                                            const balance = getRelevantBalance(leave);
                                            const isCancellationRequest = leave.status === 'Cancellation Requested';

                                            return (
                                                <tr key={leave.id} className={`transition-colors hover:bg-blue-50/30 ${isCancellationRequest ? 'bg-red-50/50' : ''}`}>
                                                    <td className="p-3">
                                                        <p className="font-medium text-gray-800">{leave.name}</p>
                                                        <p className="text-xs text-gray-500">{leave.designation}</p>
                                                        {isCancellationRequest && (
                                                            <span className="mt-1 inline-block rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                                                                WANTS TO CANCEL
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        {leave.type === 'Medical Leave' && leave.medical_file ? (
                                                            <button
                                                                onClick={() => {
                                                                    setMedicalFile(`/storage/${leave.medical_file}`);
                                                                    setShowModal(true);
                                                                }}
                                                                className="rounded-full bg-rose-100 px-3 py-1 text-xs font-medium text-rose-700 transition-colors hover:bg-rose-200"
                                                            >
                                                                Medical 📎
                                                            </button>
                                                        ) : (
                                                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${getLeaveTypeColor(leave.type)}`}>
                                                                {leave.type.replace(' Leave', '')}
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <p className="font-medium text-gray-700">
                                                            {leave.start_date} → {leave.end_date}
                                                        </p>
                                                        <p className="text-xs font-semibold text-indigo-600">
                                                            {leave.requested_days} day{leave.requested_days > 1 ? 's' : ''}
                                                        </p>
                                                    </td>
                                                    <td className="p-3">
                                                        {balance ? (
                                                            <div className="space-y-1">
                                                                <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getBalanceColor(balance.remaining)}`}>
                                                                    {balance.remaining} left
                                                                </span>
                                                                <div className="flex gap-1.5 text-xs text-gray-400">
                                                                    <span>C:{leave.remaining_casual}</span>
                                                                    <span>M:{leave.remaining_medical}</span>
                                                                    <span>E:{leave.remaining_earned}</span>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <span className="text-xs text-gray-400">∞</span>
                                                        )}
                                                    </td>
                                                    <td className="max-w-[150px] p-3">
                                                        <p className="truncate text-gray-600" title={leave.reason}>
                                                            {leave.reason || '—'}
                                                        </p>
                                                        {leave.replacement_name && (
                                                            <p className="text-xs text-gray-400">
                                                                ↻ {leave.replacement_name}
                                                            </p>
                                                        )}
                                                    </td>
                                                    <td className="p-3">
                                                        <div className="flex justify-center gap-1">
                                                            {isCancellationRequest ? (
                                                                <>
                                                                    <button
                                                                        onClick={() => approveCancel(leave.id)}
                                                                        className="rounded-lg bg-red-100 p-2 text-red-600 transition-all hover:bg-red-500 hover:text-white hover:shadow-lg"
                                                                        title="Approve Cancellation (Delete Records)"
                                                                    >
                                                                        <CircleCheck size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => denyCancel(leave.id)}
                                                                        className="rounded-lg bg-gray-100 p-2 text-gray-600 transition-all hover:bg-gray-500 hover:text-white hover:shadow-lg"
                                                                        title="Deny Cancellation (Keep Active)"
                                                                    >
                                                                        <CircleX size={18} />
                                                                    </button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <button
                                                                        onClick={() => approve(leave.id)}
                                                                        className="rounded-lg bg-emerald-100 p-2 text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white hover:shadow-lg"
                                                                        title="Approve"
                                                                    >
                                                                        <CircleCheck size={18} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => deny(leave.id)}
                                                                        className="rounded-lg bg-red-100 p-2 text-red-600 transition-all hover:bg-red-500 hover:text-white hover:shadow-lg"
                                                                        title="Deny"
                                                                    >
                                                                        <CircleX size={18} />
                                                                    </button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        {/* On Leave Today */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-100/50">
                            <div className="mb-4 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="rounded-lg bg-rose-100 p-2">
                                        <Calendar size={18} className="text-rose-600" />
                                    </div>
                                    <h2 className="font-bold text-gray-800">On Leave Today</h2>
                                </div>
                                <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-600">
                                    {today}
                                </span>
                            </div>

                            <div className="space-y-3">
                                {onLeaveToday && onLeaveToday.length > 0 ? (
                                    onLeaveToday.map((emp: any, i: number) => (
                                        <div key={i} className="flex items-center gap-3 rounded-xl border border-gray-50 bg-gray-50/50 p-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 font-bold text-indigo-600">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-800">{emp.name}</p>
                                                <p className="text-xs text-gray-500">{emp.designation}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-gray-500">No one is on leave today</p>
                                )}
                            </div>
                        </div>

                        {/* Employee Search */}
                        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-100/50">
                            <div className="mb-4 flex items-center gap-2">
                                <div className="rounded-lg bg-indigo-100 p-2">
                                    <Search size={18} className="text-indigo-600" />
                                </div>
                                <h2 className="font-bold text-gray-800">Employee History</h2>
                            </div>

                            <div className="mb-4 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search employee..."
                                    value={empSearch}
                                    onChange={(e) => setEmpSearch(e.target.value)}
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm focus:border-indigo-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                />
                            </div>

                            <div className="max-h-[300px] space-y-2 overflow-y-auto pr-1">
                                {filteredEmployees.map((emp: any) => (
                                    <button
                                        key={emp.employee_id}
                                        onClick={() => openEmployeeLeaves(emp)}
                                        className="flex w-full items-center gap-3 rounded-xl p-2 text-left transition-colors hover:bg-gray-50"
                                    >
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-xs font-bold text-gray-600">
                                            {emp.name.charAt(0)}
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="truncate font-medium text-gray-700">{emp.name}</p>
                                            <p className="truncate text-xs text-gray-500">{emp.designation}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Medical Certificate Modal */}
            {showModal && medicalFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
                    <div className="relative max-h-[90vh] max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={() => setShowModal(false)}
                            className="absolute right-4 top-4 rounded-full bg-black/20 p-2 text-white hover:bg-black/40"
                        >
                            <X size={24} />
                        </button>
                        <img src={medicalFile} alt="Medical Certificate" className="max-h-[85vh] w-full object-contain" />
                    </div>
                </div>
            )}

            {/* Employee Leaves Modal */}
            {employeeModal && selectedEmployee && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-4xl rounded-2xl bg-white shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex items-center justify-between border-b border-gray-100 p-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">{selectedEmployee.name}'s Leave History</h2>
                                <p className="text-sm text-gray-500">{selectedEmployee.designation}</p>
                            </div>
                            <button
                                onClick={() => setEmployeeModal(false)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="overflow-auto p-6">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50">
                                        <th className="p-3 text-left font-semibold text-gray-600">Type</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Duration</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Reason</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {employeeLeaves.length > 0 ? (
                                        employeeLeaves.map((l: any) => (
                                            <tr key={l.id}>
                                                <td className="p-3">
                                                    <span className={`rounded-full px-2 py-1 text-xs font-medium ${getLeaveTypeColor(l.type)}`}>
                                                        {l.type.replace(' Leave', '')}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    {l.start_date} - {l.end_date}
                                                </td>
                                                <td className="p-3 text-gray-600">{l.reason || '-'}</td>
                                                <td className="p-3">
                                                    <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600">
                                                        {l.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="p-8 text-center text-gray-500">
                                                No leave history found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
