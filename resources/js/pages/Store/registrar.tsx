import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';

export default function RegistrarVoucherIndex({ vouchers }: any) {

    const approve = (id: number) => {
        router.post(`/registrar/voucher-requests/${id}/approve`);
    };

    const deny = (id: number) => {
        router.post(`/registrar/voucher-requests/${id}/deny`);
    };

    return (
        <AppLayout>
            <Head title="Requested Vouchers - Registrar" />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-4">Voucher Requests (Registrar)</h1>

                {vouchers.length === 0 && (
                    <p className="text-gray-600">No pending requests.</p>
                )}

                <table className="w-full mt-4 border">
                    <thead className="bg-gray-100">
                    <tr>
                        {/*<th className="p-2 border">Employee ID</th>*/}
                        <th className="p-2 border">Name</th>
                        <th className="p-2 border">Dept</th>
                        {/*<th className="p-2 border">Designation</th>*/}
                        <th className="p-2 border">Product Name</th>
                        <th className="p-2 border">Quantity</th>
                        <th className="p-2 border">Action</th>
                    </tr>
                    </thead>

                    <tbody>
                    {vouchers.map((voucher: any) => (
                        <tr key={voucher.id}>
                            {/*<td className="p-2 border">{voucher.requisition_employee_id}</td>*/}
                            <td className="p-2 border">{voucher.requisitioned_by?.name}</td>
                            <td className="p-2 border">{voucher.department?.dept_name}</td>
                            {/*<td className="p-2 border">{leave.user?.designation?.name ?? '—'}</td>*/}
                            <td className="p-2 border">{voucher.product?.product_name}</td>
                            <td className="p-2 border">{voucher.requisitioned_quantity}</td>

                            <td className="p-2 border">
                                <button
                                    onClick={() => approve(voucher.id)}
                                    className="bg-green-600 text-white px-3 py-1 rounded mr-2"
                                >
                                    Approve
                                </button>

                                <button
                                    onClick={() => deny(voucher.id)}
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
