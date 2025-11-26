import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

export default function RegistrarLeaveIndex({ leaves }: any) {

    const approve = (id: number) => {
        router.post(`/registrar/leave-requests/${id}/approve`);
    };

    const deny = (id: number) => {
        router.post(`/registrar/leave-requests/${id}/deny`);
    };

    return (
        <AppLayout>
            <Head title="Leave Requests - Registrar" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Pending Leave Requests (Registrar)</h1>

                {leaves.length === 0 && (
                    <p className="text-gray-600">No pending requests.</p>
                )}

                <table className="w-full mt-4 border">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Employee ID</th>
                        <th className="p-2 border">Name</th>
                        {/*<th className="p-2 border">Designation</th>*/}
                        <th className="p-2 border">Leave Type</th>
                        <th className="p-2 border">Start Date</th>
                        <th className="p-2 border">End Date</th>
                        <th className="p-2 border">Reason</th>
                        <th className="p-2 border">Action</th>
                    </tr>
                    </thead>

                    <tbody>
                    {leaves.map((leave: any) => (
                        <tr key={leave.id}>
                            <td className="p-2 border">{leave.employee_id}</td>
                            <td className="p-2 border">{leave.user?.name}</td>
                            {/*<td className="p-2 border">{leave.user?.designation?.name ?? '—'}</td>*/}
                            <td className="p-2 border">{leave.type}</td>
                            <td className="p-2 border">{leave.start_date}</td>
                            <td className="p-2 border">{leave.end_date}</td>
                            <td className="p-2 border">{leave.reason ?? '—'}</td>

                            <td className="p-2 border">
                                <button
                                    onClick={() => approve(leave.id)}
                                    className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() => deny(leave.id)}
                                    className="bg-red-600 text-white px-3 py-1 rounded"
                                >
                                    Deny
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>

            </div>
        </AppLayout>
    );
}
