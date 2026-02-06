import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle, User, Info, CheckSquare, Square } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Leave Requests', href: '/registrar/leave-requests' }];

export default function RegistrarLeaveIndex({ leaves }: any) {
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const toggleSelectAll = () => {
        if (selectedIds.length === leaves.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(leaves.map((l: any) => l.id));
        }
    };

    const toggleSelectOne = (id: number) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const approve = (id: number) => {
        if (confirm('Are you sure you want to approve this leave request?')) {
            router.post(`/registrar/leave-requests/${id}/approve`);
        }
    };

    const deny = (id: number) => {
        if (confirm('Are you sure you want to deny this leave request?')) {
            router.post(`/registrar/leave-requests/${id}/deny`);
        }
    };

    const bulkUpdate = (status: 'Approved by Registrar' | 'Rejected by Registrar') => {
        if (selectedIds.length === 0) {
            toast.error('Please select at least one request');
            return;
        }

        const msg = status === 'Approved by Registrar'
            ? `Are you sure you want to approve ${selectedIds.length} selected leave requests?`
            : `Are you sure you want to reject ${selectedIds.length} selected leave requests?`;

        if (confirm(msg)) {
            router.post(route('registrar.leave.bulk-update'), {
                ids: selectedIds,
                status: status
            }, {
                onSuccess: () => setSelectedIds([]),
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Requests - Registrar" />

            <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">Pending Leave Requests</h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Review and finalize leave applications forwarded by department heads.
                            </p>
                        </div>
                        <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-xl flex items-center gap-2 font-semibold shadow-sm">
                            <Info size={18} />
                            <span>{leaves.length} Pending</span>
                        </div>
                    </div>

                    {leaves.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                                <User size={48} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">No pending requests</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center mt-1">There are currently no leave requests waiting for your approval.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Bulk Actions Toolbar */}
                            {selectedIds.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md border border-blue-100 dark:border-blue-900/20 flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-300 text-center">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm">
                                            {selectedIds.length}
                                        </div>
                                        <span className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-sm">Requests Selected</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => bulkUpdate('Approved by Registrar')}
                                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
                                        >
                                            <CheckCircle size={18} />
                                            Approve Selected
                                        </button>
                                        <button
                                            onClick={() => bulkUpdate('Rejected by Registrar')}
                                            className="bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm"
                                        >
                                            <XCircle size={18} />
                                            Reject Selected
                                        </button>
                                        <button
                                            onClick={() => setSelectedIds([])}
                                            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 px-3 font-semibold text-sm"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-700/50 text-center">
                                                <th className="p-4 border-b dark:border-gray-700 w-12 text-center">
                                                    <button onClick={toggleSelectAll} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors text-center">
                                                        {selectedIds.length === leaves.length ? (
                                                            <CheckSquare className="text-blue-500" size={20} />
                                                        ) : (
                                                            <Square className="text-gray-400" size={20} />
                                                        )}
                                                    </button>
                                                </th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">Employee</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">Department & Designation</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">Type</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">Duration</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">Reason</th>
                                                <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                            {leaves.map((leave: any) => (
                                                <tr
                                                    key={leave.id}
                                                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors text-center uppercase font-bold ${selectedIds.includes(leave.id) ? 'bg-blue-50/50 dark:bg-blue-900/5' : ''}`}
                                                >
                                                    <td className="p-4">
                                                        <button onClick={() => toggleSelectOne(leave.id)} className="p-1 transition-colors text-center">
                                                            {selectedIds.includes(leave.id) ? (
                                                                <CheckSquare className="text-blue-500" size={20} />
                                                            ) : (
                                                                <Square className="text-gray-300 dark:text-gray-600" size={20} />
                                                            )}
                                                        </button>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-extrabold text-gray-900 dark:text-white uppercase">{leave.user?.name}</span>
                                                            <span className="text-xs text-gray-500 dark:text-gray-400">{leave.employee_id}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-bold text-gray-700 dark:text-gray-300">{leave.user?.assignment?.department?.dept_name ?? '—'}</span>
                                                            <span className="text-[10px] text-gray-500 dark:text-gray-400">{leave.user?.assignment?.designation?.designation_name ?? '—'}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4">
                                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${leave.type === 'Casual Leave' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                                            leave.type === 'Medical Leave' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                                                                'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300'
                                                            }`}>
                                                            {leave.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex flex-col">
                                                            <span className="text-xs text-gray-900 dark:text-white font-extrabold">{leave.start_date}</span>
                                                            <span className="text-[10px] text-gray-400">TO</span>
                                                            <span className="text-xs text-gray-900 dark:text-white font-extrabold">{leave.end_date}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-4 text-left">
                                                        <p className="text-[10px] text-gray-600 dark:text-gray-400 line-clamp-2 max-w-xs">{leave.reason ?? '—'}</p>
                                                    </td>
                                                    <td className="p-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <button
                                                                onClick={() => approve(leave.id)}
                                                                className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors group relative"
                                                                title="Approve"
                                                            >
                                                                <CheckCircle size={22} />
                                                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                                    Approve
                                                                </span>
                                                            </button>
                                                            <button
                                                                onClick={() => deny(leave.id)}
                                                                className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group relative"
                                                                title="Deny"
                                                            >
                                                                <XCircle size={22} />
                                                                <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                                                                    Deny
                                                                </span>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
