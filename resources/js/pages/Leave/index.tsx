import SearchableSelect from '@/components/SearchableSelect';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, router } from '@inertiajs/react'; // Added router
import { Blocks, CalendarCheck, HeartPulse, PlusCircle, X, Calendar, FileText, Users, Upload, Building2, Trash2, AlertCircle } from 'lucide-react'; // Added icons
import { useEffect, useState, useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Leave Management', href: '/leave-management' }];

export default function Leave({ leaves, remainingCasual, remainingMedical, remainingEarned, employees, departments, userDeptId, holidays = [] }: any) {
    const [showModal, setShowModal] = useState(false);
    const [balanceError, setBalanceError] = useState<string | null>(null);
    const [dateConflictError, setDateConflictError] = useState<string | null>(null);
    const [selectedDeptId, setSelectedDeptId] = useState<number | string>(userDeptId || 'all');

    const { data, setData, post, processing, errors, reset } = useForm({
        leave_type: 'Casual Leave',
        startdate: '',
        enddate: '',
        reason: '',
        replace: '',
        medical_file: null as File | null,
    });

    const calculateDays = () => {
        if (!data.startdate || !data.enddate) return { total: 0, billable: 0 };
        const start = new Date(data.startdate);
        const end = new Date(data.enddate);

        let total = 0;
        let current = new Date(start);

        if (start > end) return { total: 0, billable: 0 };

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        return { total: diffDays, billable: diffDays };
    };

    const daysInfo = useMemo(() => calculateDays(), [data.startdate, data.enddate]);

    const cancelLeave = (id: number, status: string) => {
        if (confirm('Are you sure you want to cancel this leave request?')) {
            if (['Requested to Head', 'Requested to VC'].includes(status)) {
                router.post(route('leave.cancel', id));
            } else {
                router.post(route('leave.request-cancel', id));
            }
        }
    };

    // Filter employees based on selected department
    const filteredEmployees = useMemo(() => {
        if (selectedDeptId === 'all') {
            return employees;
        }
        return employees.filter((emp: any) => emp.department_id == selectedDeptId);
    }, [employees, selectedDeptId]);

    // Reset replacement when department changes
    useEffect(() => {
        setData('replace', '');
    }, [selectedDeptId]);

    // Set default department on modal open
    useEffect(() => {
        if (showModal && userDeptId) {
            setSelectedDeptId(userDeptId);
        }
    }, [showModal, userDeptId]);

    const submitLeave = () => {
        const { billable: requestedDays } = calculateDays();
        let remaining = 0;

        if (data.leave_type === 'Casual Leave') {
            remaining = remainingCasual;
        } else if (data.leave_type === 'Medical Leave') {
            remaining = remainingMedical;
        } else if (data.leave_type === 'Earned Leave') {
            remaining = remainingEarned;
        }

        if (data.leave_type !== 'Duty Leave' && requestedDays > remaining) {
            setBalanceError(`Requested ${requestedDays} day(s), but only ${remaining} ${data.leave_type} remaining.`);
            return;
        }

        post(route('leave.request'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowModal(false);
                setSelectedDeptId(userDeptId || 'all');
            },
        });
    };

    useEffect(() => {
        const conflict = (errors as any).date_conflict;
        if (conflict) {
            setDateConflictError(conflict);
        }
    }, [errors]);

    const leaveTypeConfig: any = {
        'Casual Leave': { color: 'blue', icon: CalendarCheck, remaining: remainingCasual },
        'Medical Leave': { color: 'rose', icon: HeartPulse, remaining: remainingMedical },
        'Earned Leave': { color: 'violet', icon: Blocks, remaining: remainingEarned },
        'Duty Leave': { color: 'teal', icon: Calendar, remaining: '∞' },
    };

    const getStatusStyle = (status: string) => {
        if (status.includes('Approved')) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (status.includes('Denied') || status.includes('Rejected')) return 'bg-red-100 text-red-700 border-red-200';
        if (status === 'Cancellation Requested') return 'bg-slate-100 text-slate-700 border-slate-200';
        return 'bg-amber-100 text-amber-700 border-amber-200';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Management" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* LEFT COLUMN */}
                    <div className="space-y-4">
                        {/* Leave Balance Cards */}
                        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-blue-500 p-3 text-white shadow-lg shadow-blue-200">
                                    <CalendarCheck className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-blue-600">Casual Leave</p>
                                    <p className="text-3xl font-bold text-blue-700">{remainingCasual}</p>
                                    <p className="text-xs text-blue-500">days remaining</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50 to-pink-50 p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-rose-500 p-3 text-white shadow-lg shadow-rose-200">
                                    <HeartPulse className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-rose-600">Medical Leave</p>
                                    <p className="text-3xl font-bold text-rose-700">{remainingMedical}</p>
                                    <p className="text-xs text-rose-500">days remaining</p>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 p-5 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="rounded-xl bg-violet-500 p-3 text-white shadow-lg shadow-violet-200">
                                    <Blocks className="h-6 w-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-violet-600">Earned Leave</p>
                                    <p className="text-3xl font-bold text-violet-700">{remainingEarned}</p>
                                    <p className="text-xs text-violet-500">days remaining</p>
                                </div>
                            </div>
                        </div>

                        {/* Apply Leave Button */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex w-full items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-5 text-white shadow-lg shadow-indigo-200 transition-all hover:from-indigo-700 hover:to-purple-700 hover:shadow-xl"
                        >
                            <div className="rounded-xl bg-white/20 p-3">
                                <PlusCircle className="h-6 w-6" />
                            </div>
                            <div className="text-left">
                                <p className="text-lg font-semibold">Apply for Leave</p>
                                <p className="text-sm opacity-90">Submit a new request</p>
                            </div>
                        </button>

                        {/* Info Note */}
                        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-700">
                            <p className="font-medium">ℹ️ Note</p>
                            <p className="mt-1">
                                Leave balances are calculated from <span className="font-semibold">January 01, 2026</span>.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT COLUMN - Leave History */}
                    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-100/50 lg:col-span-3">
                        <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-800">
                            <FileText className="h-5 w-5 text-indigo-600" />
                            Leave History
                        </h2>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gray-50/50">
                                        <th className="p-3 text-left font-semibold text-gray-600">Type</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Duration</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Reason</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Replacement</th>
                                        <th className="p-3 text-left font-semibold text-gray-600">Status</th>
                                        <th className="p-3 text-center font-semibold text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {leaves.length > 0 ? (
                                        leaves.map((l: any) => (
                                            <tr key={l.id} className="transition-colors hover:bg-blue-50/30">
                                                <td className="p-3">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${l.type === 'Casual Leave' ? 'bg-blue-100 text-blue-700' :
                                                        l.type === 'Medical Leave' ? 'bg-rose-100 text-rose-700' :
                                                            l.type === 'Earned Leave' ? 'bg-violet-100 text-violet-700' :
                                                                'bg-teal-100 text-teal-700'
                                                        }`}>
                                                        {l.type.replace(' Leave', '')}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <p className="font-medium text-gray-700">{l.start_date} → {l.end_date}</p>
                                                </td>
                                                <td className="max-w-[200px] p-3">
                                                    <p className="truncate text-gray-600" title={l.reason}>{l.reason || '—'}</p>
                                                </td>
                                                <td className="p-3 text-gray-600">{l.replacement_name || '—'}</td>
                                                <td className="p-3">
                                                    <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusStyle(l.status)}`}>
                                                        {l.status}
                                                    </span>
                                                </td>
                                                <td className="p-3 text-center">
                                                    {['Requested to Head', 'Requested to VC'].includes(l.status) && (
                                                        <button
                                                            onClick={() => cancelLeave(l.id, l.status)}
                                                            className="rounded-lg bg-red-100 p-2 text-red-600 hover:bg-red-200"
                                                            title="Cancel Request"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                    {['Sent to Registrar', 'Approved by Registrar', 'Approved by VC'].includes(l.status) && (
                                                        <button
                                                            onClick={() => cancelLeave(l.id, l.status)}
                                                            className="rounded-lg bg-amber-100 p-2 text-amber-600 hover:bg-amber-200"
                                                            title="Request Cancellation"
                                                        >
                                                            <AlertCircle size={16} />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={6} className="py-12 text-center text-gray-400">
                                                <FileText className="mx-auto mb-2 h-10 w-10 opacity-50" />
                                                <p>No leave history found</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* IMPROVED LEAVE REQUEST MODAL */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-white/20 p-2">
                                        <Calendar className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-bold text-white">Request Leave</h2>
                                        <p className="text-sm text-white/80">Fill in the details below</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => { setShowModal(false); reset(); setSelectedDeptId(userDeptId || 'all'); }}
                                    className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Modal Body */}
                        <div className="max-h-[70vh] overflow-y-auto p-6">
                            {/* Leave Type Selection */}
                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Leave Type</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {Object.entries(leaveTypeConfig).map(([type, config]: any) => {
                                        const Icon = config.icon;
                                        const isSelected = data.leave_type === type;
                                        return (
                                            <button
                                                key={type}
                                                type="button"
                                                onClick={() => {
                                                    setData('leave_type', type);
                                                    if (type !== 'Medical Leave') {
                                                        setData('medical_file', null);
                                                    }
                                                }}
                                                className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all ${isSelected
                                                    ? `border-${config.color}-500 bg-${config.color}-50 shadow-sm`
                                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon className={`h-5 w-5 ${isSelected ? `text-${config.color}-600` : 'text-gray-400'}`} />
                                                <div>
                                                    <p className={`text-sm font-medium ${isSelected ? `text-${config.color}-700` : 'text-gray-700'}`}>
                                                        {type.replace(' Leave', '')}
                                                    </p>
                                                    <p className={`text-xs ${isSelected ? `text-${config.color}-500` : 'text-gray-400'}`}>
                                                        {config.remaining} left
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.leave_type && <p className="mt-1 text-sm text-red-600">{errors.leave_type}</p>}
                            </div>

                            {/* Date Range */}
                            <div className="mb-5 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">Start Date</label>
                                    <input
                                        type="date"
                                        value={data.startdate}
                                        onChange={(e) => setData('startdate', e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm transition-all focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                                    />
                                    {errors.startdate && <p className="mt-1 text-sm text-red-600">{errors.startdate}</p>}
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">End Date</label>
                                    <input
                                        type="date"
                                        value={data.enddate}
                                        onChange={(e) => setData('enddate', e.target.value)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm transition-all focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                                    />
                                    {errors.enddate && <p className="mt-1 text-sm text-red-600">{errors.enddate}</p>}
                                </div>
                            </div>

                            {/* Days Preview */}
                            {data.startdate && data.enddate && daysInfo.total > 0 && (
                                <div className="mb-5 rounded-xl border border-indigo-200 bg-indigo-50 p-3">
                                    <div className="text-center">
                                        <p className="text-sm font-medium text-indigo-700">
                                            📅 Duration: <span className="text-lg font-bold">{daysInfo.billable}</span> day{daysInfo.billable !== 1 ? 's' : ''}
                                        </p>
                                        {(daysInfo.total !== daysInfo.billable) && (
                                            <p className="text-xs text-indigo-500 mt-1">
                                                (Total span: {daysInfo.total} days. Weekends & Holidays excluded)
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Medical Certificate */}
                            {data.leave_type === 'Medical Leave' && (
                                <div className="mb-5">
                                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                                        <Upload className="mr-1 inline h-4 w-4" />
                                        Medical Certificate
                                    </label>
                                    <input
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={(e) => setData('medical_file', e.target.files?.[0] || null)}
                                        className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-indigo-100 file:px-3 file:py-1 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-200"
                                    />
                                    {errors.medical_file && <p className="mt-1 text-sm text-red-600">{errors.medical_file}</p>}
                                </div>
                            )}

                            {/* Reason */}
                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-semibold text-gray-700">Reason (Optional)</label>
                                <textarea
                                    value={data.reason}
                                    onChange={(e) => setData('reason', e.target.value)}
                                    rows={2}
                                    placeholder="Briefly describe the reason for your leave..."
                                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm transition-all focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none"
                                />
                                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
                            </div>

                            {/* Replacement Section */}
                            <div className="mb-5 rounded-xl border border-gray-200 bg-gray-50 p-4">
                                <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <Users className="h-4 w-4" />
                                    Replacement Employee
                                </label>

                                {/* Department Selection */}
                                <div className="mb-3">
                                    <label className="mb-1 block text-xs font-medium text-gray-500">
                                        <Building2 className="mr-1 inline h-3 w-3" />
                                        Select Department
                                    </label>
                                    <select
                                        value={selectedDeptId}
                                        onChange={(e) => setSelectedDeptId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                                        className="w-full rounded-lg border border-gray-200 bg-white p-2.5 text-sm transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                                    >
                                        <option value="all">All Departments</option>
                                        {departments.map((dept: any) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.dept_name} {dept.id === userDeptId ? '(Your Dept)' : ''}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Employee Selection */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-gray-500">Select Replacement</label>
                                    <SearchableSelect
                                        items={filteredEmployees.map((emp: any) => ({
                                            ...emp,
                                            displayName: `${emp.name}${emp.designation ? ` - ${emp.designation}` : ''}${emp.dept_name && selectedDeptId === 'all' ? ` (${emp.dept_name})` : ''}`
                                        }))}
                                        value={data.replace}
                                        onChange={(val: any) => setData('replace', val)}
                                        placeholder={filteredEmployees.length > 0 ? "Search and select employee..." : "No employees in this department"}
                                        labelKey="displayName"
                                        valueKey="employee_id"
                                    />
                                </div>
                                {errors.replace && <p className="mt-1 text-sm text-red-600">{errors.replace}</p>}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t border-gray-100 bg-gray-50 px-6 py-4">
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setShowModal(false); reset(); setSelectedDeptId(userDeptId || 'all'); }}
                                    className="flex-1 rounded-xl border border-gray-200 bg-white py-3 font-medium text-gray-700 transition-all hover:bg-gray-100"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submitLeave}
                                    disabled={processing}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 font-medium text-white transition-all hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 shadow-lg shadow-indigo-200"
                                >
                                    {processing ? 'Submitting...' : 'Submit Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Balance Error Modal */}
            {balanceError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-96 rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-red-100 p-2">
                                <X className="h-5 w-5 text-red-600" />
                            </div>
                            <h2 className="text-lg font-bold text-red-600">Balance Exceeded</h2>
                        </div>
                        <p className="mb-6 text-gray-600">{balanceError}</p>
                        <button
                            onClick={() => setBalanceError(null)}
                            className="w-full rounded-xl bg-red-600 py-2.5 font-medium text-white hover:bg-red-700"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {/* Date Conflict Error Modal */}
            {dateConflictError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="w-96 rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center gap-3">
                            <div className="rounded-full bg-amber-100 p-2">
                                <Calendar className="h-5 w-5 text-amber-600" />
                            </div>
                            <h2 className="text-lg font-bold text-amber-600">Date Conflict</h2>
                        </div>
                        <p className="mb-6 text-gray-600">{dateConflictError}</p>
                        <button
                            onClick={() => setDateConflictError(null)}
                            className="w-full rounded-xl bg-amber-600 py-2.5 font-medium text-white hover:bg-amber-700"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
