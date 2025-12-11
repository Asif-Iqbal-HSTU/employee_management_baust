import AppLayout from "@/layouts/app-layout";
import { Head, Link, useForm } from "@inertiajs/react";

export default function VoucherAllow({ department, pending, allowed }: any) {
    const { post } = useForm({});

    const approveVoucher = (id: number) => {
        post(route("voucher.head.approve", id));
    };

    return (
        <AppLayout>
            <Head title="Approve Store Vouchers" />

            <div className="p-6">
                <h1 className="text-xl font-semibold mb-4">
                    {department.name} — Voucher Approval
                </h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT — Pending Vouchers */}
                    <div className="bg-white p-5 rounded shadow">
                        <h2 className="text-lg font-semibold mb-3">Vouchers to be Allowed</h2>

                        {pending.length === 0 && (
                            <p className="text-gray-500 text-sm">No pending vouchers.</p>
                        )}

                        <table className="w-full border mt-3">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border">Date</th>
                                <th className="p-2 border">Product</th>
                                <th className="p-2 border">Qty</th>
                                <th className="p-2 border">Action</th>
                            </tr>
                            </thead>
                            <tbody>
                            {pending.map((v: any) => (
                                <tr key={v.id} className="border">
                                    <td className="p-2 border">{v.date}</td>
                                    <td className="p-2 border">{v.product?.product_name}</td>
                                    <td className="p-2 border">{v.requisitioned_quantity}</td>

                                    <td className="p-2 border text-center">
                                        <button
                                            onClick={() => approveVoucher(v.id)}
                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Approve
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>

                    {/* RIGHT — Allowed Vouchers */}
                    <div className="bg-white p-5 rounded shadow">
                        <h2 className="text-lg font-semibold mb-3">Allowed Vouchers</h2>

                        {allowed.length === 0 && (
                            <p className="text-gray-500 text-sm">No approved vouchers yet.</p>
                        )}

                        <table className="w-full border mt-3">
                            <thead>
                            <tr className="bg-gray-100">
                                <th className="p-2 border">Date</th>
                                <th className="p-2 border">Product</th>
                                <th className="p-2 border">Qty</th>
                                <th className="p-2 border">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {allowed.map((v: any) => (
                                <tr key={v.id} className="border">
                                    <td className="p-2 border">{v.date}</td>
                                    <td className="p-2 border">{v.product?.product_name}</td>
                                    <td className="p-2 border">{v.requisitioned_quantity}</td>
                                    <td className="p-2 border text-green-600">Approved</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
