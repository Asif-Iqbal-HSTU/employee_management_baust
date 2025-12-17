import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { router } from "@inertiajs/core"; // 💡 Import 'router' from the core library

export default function VoucherAllow({ department, pending, allowed }: any) {
    const { post } = useForm({});

    const approveVoucher = (id: number) => {
        post(route("voucher.head.approve", id));
    };

    const bulkApprove = (employee_id: number, date: string) => {
        console.log(`Submitting bulk: EID=${employee_id}, Date=${date}`);

        // 💡 Use router.post instead of Inertia.post or post(data)
        router.post(route("voucher.head.approve.bulk"), {
            employee_id: employee_id,
            date: date,
        });
    };

    /**
     * Returns true if this voucher is the last one
     * of the same employee on the same date
     */
    const isLastOfGroup = (list: any[], index: number) => {
        const current = list[index];
        const next = list[index + 1];

        if (!next) return true;

        return (
            current.requisition_employee_id !== next.requisition_employee_id ||
            current.date !== next.date
        );
    };

    return (
        <AppLayout>
            <Head title="Approve Store Vouchers" />

            <div className="p-6">
                <h1 className="mb-4 text-xl font-semibold">
                    {department.name} — Voucher Approval
                </h1>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* ================= LEFT — PENDING ================= */}
                    <div className="rounded bg-white p-5 shadow">
                        <h2 className="mb-3 text-lg font-semibold">
                            Vouchers to be Allowed
                        </h2>

                        {pending.length === 0 && (
                            <p className="text-sm text-gray-500">
                                No pending vouchers.
                            </p>
                        )}

                        {pending.length > 0 && (
                            <table className="mt-3 w-full border">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2">Date</th>
                                    <th className="border p-2">Product</th>
                                    <th className="border p-2">Qty</th>
                                    <th className="border p-2">Action</th>
                                </tr>
                                </thead>

                                <tbody>
                                {pending.map((v: any, index: number) => (
                                    <React.Fragment key={v.id}>
                                        {/* Voucher Row */}
                                        <tr className="border">
                                            <td className="border p-2">
                                                {v.date}
                                            </td>
                                            <td className="border p-2">
                                                {v.product?.product_name}
                                            </td>
                                            <td className="border p-2 text-right">
                                                {v.requisitioned_quantity}
                                            </td>
                                            <td className="border p-2 text-center">
                                                <button
                                                    onClick={() =>
                                                        approveVoucher(v.id)
                                                    }
                                                    className="rounded bg-green-600 px-2 py-1 text-xs text-white hover:bg-green-700"
                                                >
                                                    Approve
                                                </button>
                                            </td>
                                        </tr>

                                        {/* Bulk Approve Button (ONLY once per group) */}
                                        {isLastOfGroup(pending, index) && (
                                            <tr className="bg-gray-50">
                                                <td
                                                    colSpan={4}
                                                    className="border p-2 text-right"
                                                >
                                                    <button
                                                        onClick={() =>
                                                            bulkApprove(
                                                                v.requisition_employee_id,
                                                                v.date
                                                            )
                                                        }
                                                        className="rounded bg-blue-600 px-4 py-1 text-sm text-white hover:bg-blue-700"
                                                    >
                                                        Approve All (Same
                                                        Person, Same Day)
                                                    </button>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* ================= RIGHT — ALLOWED ================= */}
                    <div className="rounded bg-white p-5 shadow">
                        <h2 className="mb-3 text-lg font-semibold">
                            Allowed Vouchers
                        </h2>

                        {allowed.length === 0 && (
                            <p className="text-sm text-gray-500">
                                No approved vouchers yet.
                            </p>
                        )}

                        {allowed.length > 0 && (
                            <table className="mt-3 w-full border">
                                <thead>
                                <tr className="bg-gray-100">
                                    <th className="border p-2">Date</th>
                                    <th className="border p-2">Product</th>
                                    <th className="border p-2">Qty</th>
                                    <th className="border p-2">Status</th>
                                </tr>
                                </thead>

                                <tbody>
                                {allowed.map((v: any) => (
                                    <tr key={v.id} className="border">
                                        <td className="border p-2">
                                            {v.date}
                                        </td>
                                        <td className="border p-2">
                                            {v.product?.product_name}
                                        </td>
                                        <td className="border p-2 text-right">
                                            {v.requisitioned_quantity}
                                        </td>
                                        <td className="border p-2 font-semibold text-green-600">
                                            Approved
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
