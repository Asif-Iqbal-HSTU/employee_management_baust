import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { CircleCheck, CircleX, Calendar, ClipboardList, UserCheck, Crown, X } from 'lucide-react';
import { useState } from 'react';

export default function VCLeaveApproval({ leaves }: any) {
    const [showModal, setShowModal] = useState(false);
    const [medicalFile, setMedicalFile] = useState<string | null>(null);

    const approve = (id: number) => {
        router.post(`/vc/leaves/${id}/approve`);
    };

    const deny = (id: number) => {
        router.post(`/vc/leaves/${id}/deny`);
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
            <Head title="Leave Requests - Vice Chancellor" />

            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-6">
                {/* Header */}
                <div className="mb-6">
                    <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 p-3 text-white shadow-lg shadow-amber-200">
                            <Crown size={24} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Vice Chancellor's Leave Approval</h1>
                            <p className="text-gray-500">Review and approve leave requests from senior officers</p>
                        </div>
                    </div>
                </div>

                {/* Stats Card */}
                <div className="mb-6">
                    <div className="inline-flex items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 px-6 py-4 shadow-sm">
                        <div className="rounded-lg bg-amber-500 p-2.5 text-white shadow-lg shadow-amber-200">
                            <ClipboardList size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-700">{leaves.length}</p>
                            <p className="text-sm text-amber-600">Pending Requests</p>
                        </div>
                    </div>
                </div>

                {/* Leave Requests Table */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-100/50">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-lg bg-amber-100 p-2">
                            <ClipboardList size={18} className="text-amber-600" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-800">Senior Officers' Leave Requests</h2>
                    </div>

                    {leaves.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                            <UserCheck size={56} className="mb-4 opacity-50" />
                            <p className="text-xl font-medium">No pending requests</p>
                            <p className="text-sm">All senior officer leave requests have been processed</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50">
                                        <th className="p-4 text-left font-semibold text-gray-600">Officer</th>
                                        <th className="p-4 text-left font-semibold text-gray-600">Department</th>
                                        <th className="p-4 text-left font-semibold text-gray-600">Leave Type</th>
                                        <th className="p-4 text-left font-semibold text-gray-600">Duration</th>
                                        <th className="p-4 text-left font-semibold text-gray-600">Reason</th>
                                        <th className="p-4 text-left font-semibold text-gray-600">Replacement</th>
                                        <th className="p-4 text-center font-semibold text-gray-600">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {leaves.map((leave: any) => (
                                        <tr key={leave.id} className="transition-colors hover:bg-amber-50/30">
                                            <td className="p-4">
                                                <p className="font-semibold text-gray-800">{leave.name}</p>
                                                <p className="text-xs text-gray-500">{leave.designation}</p>
                                                <p className="text-xs text-amber-600">ID: {leave.employee_id}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-700">{leave.department || 'N/A'}</span>
                                            </td>
                                            <td className="p-4">
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
                                                        {leave.type}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium text-gray-700">
                                                    {leave.start_date} → {leave.end_date}
                                                </p>
                                                <p className="text-xs font-semibold text-amber-600">
                                                    {leave.requested_days} day{leave.requested_days > 1 ? 's' : ''}
                                                </p>
                                            </td>
                                            <td className="max-w-[200px] p-4">
                                                <p className="text-gray-600" title={leave.reason}>
                                                    {leave.reason || '—'}
                                                </p>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-gray-600">{leave.replacement_name || '—'}</span>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex justify-center gap-2">
                                                    <button
                                                        onClick={() => approve(leave.id)}
                                                        className="rounded-lg bg-emerald-100 px-4 py-2 text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white hover:shadow-lg flex items-center gap-1"
                                                        title="Approve"
                                                    >
                                                        <CircleCheck size={18} />
                                                        <span className="text-sm font-medium">Approve</span>
                                                    </button>
                                                    <button
                                                        onClick={() => deny(leave.id)}
                                                        className="rounded-lg bg-red-100 px-4 py-2 text-red-600 transition-all hover:bg-red-500 hover:text-white hover:shadow-lg flex items-center gap-1"
                                                        title="Deny"
                                                    >
                                                        <CircleX size={18} />
                                                        <span className="text-sm font-medium">Deny</span>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Medical Certificate Modal */}
            {showModal && medicalFile && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="max-h-[90vh] w-[90%] max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b bg-gradient-to-r from-rose-50 to-pink-50 p-4">
                            <h2 className="text-lg font-bold text-gray-800">Medical Certificate</h2>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setMedicalFile(null);
                                }}
                                className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-white hover:text-gray-800"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="h-[80vh] overflow-auto bg-gray-50 p-4">
                            {medicalFile.endsWith('.pdf') ? (
                                <iframe src={medicalFile} className="h-full w-full rounded-xl border bg-white" />
                            ) : (
                                <img src={medicalFile} alt="Medical Certificate" className="mx-auto max-w-full rounded-xl shadow-lg" />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
