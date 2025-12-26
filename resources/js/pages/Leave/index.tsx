import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { CalendarCheck, HeartPulse, PlusCircle } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Leave Management', href: '/leave-management' }];

export default function Leave({ leaves, remainingCasual, remainingMedical }: any) {

    const [showModal, setShowModal] = useState(false);
    const [leaveType, setLeaveType] = useState("Casual Leave");
    const [startdate, setStartdate] = useState("");
    const [enddate, setEnddate] = useState("");
    const [reason, setReason] = useState("");
    const [replace, setReplace] = useState("");
    const [medicalFile, setMedicalFile] = useState<File | null>(null);

    /*const submitLeave = () => {
        router.post('/leave-management/request', {
            leave_type: leaveType,
            startdate,
            enddate,
            reason,
            replace,
        }, {
            onSuccess: () => {
                setShowModal(false);
                setStartdate("");
                setEnddate("");
                setReason("");
                setReplace("");
            }
        });
    };*/

    const submitLeave = () => {
        router.post(
            '/leave-management/request',
            {
                leave_type: leaveType,
                startdate,
                enddate,
                reason,
                replace,
                medical_file: medicalFile, // 👈 important
            },
            {
                forceFormData: true, // 👈 REQUIRED
                onSuccess: () => {
                    setShowModal(false);
                    setStartdate('');
                    setEnddate('');
                    setReason('');
                    setReplace('');
                    setMedicalFile(null);
                },
            }
        );
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Management" />

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

                {/* LEFT COLUMN */}
                <div className="space-y-6">

                    {/* Casual Leave Card */}
                    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                        <CalendarCheck className="h-10 w-10 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-500">Casual Leave Remaining</p>
                            <p className="text-2xl font-bold text-blue-600">{remainingCasual}</p>
                        </div>
                    </div>

                    {/* Medical Leave Card */}
                    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                        <HeartPulse className="h-10 w-10 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-500">Medical Leave Remaining</p>
                            <p className="text-2xl font-bold text-green-600">{remainingMedical}</p>
                        </div>
                    </div>

                    {/* Apply Leave Card */}
                    <div
                        onClick={() => setShowModal(true)}
                        className="cursor-pointer bg-indigo-600 text-white rounded-xl shadow p-5 flex items-center gap-4 hover:bg-indigo-700 transition"
                    >
                        <PlusCircle className="h-10 w-10" />
                        <div>
                            <p className="text-lg font-semibold">Apply for Leave</p>
                            <p className="text-sm opacity-90">Submit a new leave request</p>
                        </div>
                    </div>
                    {/* Leave Balance Note */}
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                        <p className="font-medium">ℹ️ Note</p>
                        <p className="mt-1">
                            Leave balances will be adjusted starting from
                            <span className="font-semibold"> January 01, 2026</span>.
                        </p>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Leave History</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded">
                            <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="border px-4 py-2">Type</th>
                                <th className="border px-4 py-2">Start Date</th>
                                <th className="border px-4 py-2">End Date</th>
                                <th className="border px-4 py-2">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {leaves.length > 0 ? (
                                leaves.map((l: any) => (
                                    <tr key={l.id} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{l.type}</td>
                                        <td className="border px-4 py-2">{l.start_date}</td>
                                        <td className="border px-4 py-2">{l.end_date}</td>
                                        <td className="border px-4 py-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium
                                                    ${l.status === 'Approved' ? 'bg-green-100 text-green-700' :
                                                    l.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                    {l.status}
                                                </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500">
                                        No leave history found
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL (unchanged logic) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Request Leave</h2>

                        <label className="block mb-1 text-sm font-medium">Leave Type</label>
                        <select
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                            className="w-full border rounded p-2 mb-3"
                        >
                            <option value="Casual Leave">Casual Leave</option>
                            <option value="Medical Leave">Medical Leave</option>
                            <option value="Earned Leave">Earned Leave</option>
                            <option value="Duty Leave">Duty Leave</option>
                        </select>

                        <label className="block mb-1 text-sm font-medium">Start Date</label>
                        <input type="date" value={startdate}
                               onChange={(e) => setStartdate(e.target.value)}
                               className="w-full border rounded p-2 mb-3"
                        />

                        <label className="block mb-1 text-sm font-medium">End Date</label>
                        <input type="date" value={enddate}
                               onChange={(e) => setEnddate(e.target.value)}
                               className="w-full border rounded p-2 mb-3"
                        />

                        {/* Medical Certificate Upload (Only for Medical Leave) */}
                        {leaveType === 'Medical Leave' && (
                            <>
                                <label className="block mb-1 text-sm font-medium">
                                    Medical Certificate / Prescription
                                </label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setMedicalFile(e.target.files?.[0] || null)}
                                    className="w-full border rounded p-2 mb-3"
                                />
                                <p className="text-xs text-gray-500 mb-3">
                                    Allowed formats: PDF, JPG, PNG (Max 2MB)
                                </p>
                            </>
                        )}


                        <label className="block mb-1 text-sm font-medium">Reason</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border rounded p-2 mb-3"
                        />

                        <label className="block mb-1 text-sm font-medium">Replacement</label>
                        <input
                            value={replace}
                            onChange={(e) => setReplace(e.target.value)}
                            className="w-full border rounded p-2 mb-4"
                        />

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">
                                Cancel
                            </button>
                            <button onClick={submitLeave} className="px-4 py-2 bg-indigo-600 text-white rounded">
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
