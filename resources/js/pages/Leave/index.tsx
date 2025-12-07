import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Leave({ leaves, remainingCasual, remainingMedical }: any) {

    const [showModal, setShowModal] = useState(false);
    const [leaveType, setLeaveType] = useState("Casual Leave");
    const [startdate, setStartdate] = useState("");
    const [enddate, setEnddate] = useState("");
    const [reason, setReason] = useState("");
    const [replace, setReplace] = useState("");

    const submitLeave = () => {
        router.post('/leave-management/request', {
            leave_type: leaveType,
            startdate: startdate,
            enddate: enddate,
            reason: reason,
            replace: replace,
        }, {
            onSuccess: () => {
                setShowModal(false);
                setStartdate("");
                setEnddate("");
                setReason("");
                setReplace("");
            }
        });

    };

    return (
        <AppLayout>
            <Head title="Leave Management" />

            {/* Remaining Leave Summary */}
            <div className="p-6 bg-white rounded shadow mb-6">
                <h2 className="text-xl font-bold mb-3">Remaining Leaves</h2>
                <div className="flex gap-10">
                    <div className="text-lg">
                        <span className="font-semibold">Casual Leave:</span>
                        <span className="ml-2 text-blue-600">{remainingCasual}</span>
                    </div>
                    <div className="text-lg">
                        <span className="font-semibold">Medical Leave:</span>
                        <span className="ml-2 text-green-600">{remainingMedical}</span>
                    </div>
                </div>
            </div>

            {/* Request Leave Button */}
            <button
                onClick={() => setShowModal(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded shadow hover:bg-indigo-700"
            >
                Request Leave
            </button>

            {/* Leave Request Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded shadow-lg w-96">
                        <h2 className="text-lg font-bold mb-4">Request Leave</h2>

                        {/* Leave Type */}
                        <label className="block mb-2 text-sm font-medium">Leave Type</label>
                        <select
                            value={leaveType}
                            onChange={(e) => setLeaveType(e.target.value)}
                            className="w-full border rounded p-2 mb-4"
                        >
                            <option value="Casual Leave">Casual Leave</option>
                            <option value="Medical Leave">Medical Leave</option>
                        </select>

                        {/* Leave Date */}
                        <label className="block mb-2 text-sm font-medium">Start Date</label>
                        <input
                            type="date"
                            value={startdate}
                            onChange={(e) => setStartdate(e.target.value)}
                            className="w-full border rounded p-2 mb-4"
                        />

                        <label className="block mb-2 text-sm font-medium">End Date</label>
                        <input
                            type="date"
                            value={enddate}
                            onChange={(e) => setEnddate(e.target.value)}
                            className="w-full border rounded p-2 mb-4"
                        />

                        {/* Reason */}
                        <label className="block mb-2 text-sm font-medium">Reason (Optional)</label>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="w-full border rounded p-2 mb-4"
                            placeholder="Write reason..."
                        />

                        {/* Replacement */}
                        <label className="block mb-2 text-sm font-medium">Replacement Person (Optional)</label>
                        <input
                            value={replace}
                            onChange={(e) => setReplace(e.target.value)}
                            className="w-full border rounded p-2 mb-4"
                            placeholder="Employee ID or Name"
                        />


                        {/* Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                className="px-4 py-2 bg-gray-300 rounded"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>

                            <button
                                className="px-4 py-2 bg-indigo-600 text-white rounded"
                                onClick={submitLeave}
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Leave History Table */}
            <div className="mt-8 bg-white p-6 rounded shadow">
                <h2 className="text-xl font-bold mb-4">Leave History</h2>

                <table className="w-full border">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border px-3 py-2">Type</th>
                        <th className="border px-3 py-2">Start Date</th>
                        <th className="border px-3 py-2">End Date</th>
                        <th className="border px-3 py-2">Status</th>
                    </tr>
                    </thead>
                    <tbody>
                    {leaves.map((l: any) => (
                        <tr key={l.id}>
                            <td className="border px-3 py-2">{l.type}</td>
                            <td className="border px-3 py-2">{l.start_date}</td>
                            <td className="border px-3 py-2">{l.end_date}</td>
                            <td className="border px-3 py-2">{l.status}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

        </AppLayout>
    );
}
