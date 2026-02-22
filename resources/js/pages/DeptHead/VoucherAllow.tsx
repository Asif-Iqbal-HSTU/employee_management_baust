import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { router } from "@inertiajs/core"; // 💡 Import 'router' from the core library
import { Check, X, User as UserIcon, Calendar, Package, Hash, CheckCircle2, AlertCircle } from "lucide-react";

export default function VoucherAllow({ department, pending, allowed }: any) {
    const { post } = useForm({});

    const approveVoucher = (id: number) => {
        post(route("voucher.head.approve", id));
    };

    const denyVoucher = (id: number) => {
        if (confirm("Are you sure you want to deny this voucher?")) {
            post(route("voucher.head.deny", id));
        }
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
                                    <tr className="bg-gray-100 text-left text-sm uppercase tracking-wider text-gray-700">
                                        <th className="border p-2">Date</th>
                                        <th className="border p-2">Requester</th>
                                        <th className="border p-2">Product</th>
                                        <th className="border p-2">Qty</th>
                                        <th className="border p-2 text-center">Action</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {pending.map((v: any, index: number) => (
                                        <React.Fragment key={v.id}>
                                            {/* Voucher Row */}
                                            <tr className="border transition-colors hover:bg-gray-50">
                                                <td className="border p-2 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {v.date}
                                                    </div>
                                                </td>
                                                <td className="border p-2 text-sm">
                                                    <div className="flex items-center gap-1 font-medium text-gray-900">
                                                        <UserIcon size={14} className="text-gray-400" />
                                                        {v.requisitioned_by?.name}
                                                    </div>
                                                    <div className="pl-5 text-xs text-gray-500">
                                                        {v.requisitioned_by?.assignment?.designation?.designation_name || "N/A"}
                                                    </div>
                                                </td>
                                                <td className="border p-2 text-sm">
                                                    <div className="flex items-center gap-1">
                                                        <Package size={14} className="text-gray-400" />
                                                        {v.product?.product_name}
                                                    </div>
                                                </td>
                                                <td className="border p-2 text-right text-sm">
                                                    <span className="font-semibold text-blue-600">{v.requisitioned_quantity}</span>
                                                </td>
                                                <td className="border p-2 text-center">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <button
                                                            onClick={() => approveVoucher(v.id)}
                                                            className="flex items-center gap-1 rounded bg-green-600 px-3 py-1 text-xs font-medium text-white shadow-sm transition-all hover:bg-green-700 active:scale-95"
                                                            title="Approve"
                                                        >
                                                            <Check size={14} />
                                                            Approve
                                                        </button>
                                                        <button
                                                            onClick={() => denyVoucher(v.id)}
                                                            className="flex items-center gap-1 rounded bg-red-600 px-3 py-1 text-xs font-medium text-white shadow-sm transition-all hover:bg-red-700 active:scale-95"
                                                            title="Deny"
                                                        >
                                                            <X size={14} />
                                                            Deny
                                                        </button>
                                                    </div>
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
                                                            className="flex items-center gap-2 rounded bg-blue-600 px-4 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-md transition-all hover:bg-blue-700 active:scale-95"
                                                        >
                                                            <CheckCircle2 size={16} />
                                                            Approve All for {v.requisitioned_by?.name} (Today)
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
                                    <tr className="bg-gray-100 text-left text-sm uppercase tracking-wider text-gray-700">
                                        <th className="border p-2">Date</th>
                                        <th className="border p-2">Requester</th>
                                        <th className="border p-2">Product</th>
                                        <th className="border p-2">Qty</th>
                                        <th className="border p-2">Status</th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {allowed.map((v: any) => (
                                        <tr key={v.id} className="border transition-colors hover:bg-gray-50">
                                            <td className="border p-2 text-sm text-gray-600">
                                                {v.date}
                                            </td>
                                            <td className="border p-2 text-sm">
                                                <div className="flex items-center gap-1 font-medium text-gray-900">
                                                    <UserIcon size={14} className="text-gray-400" />
                                                    {v.requisitioned_by?.name}
                                                </div>
                                                <div className="pl-5 text-xs text-gray-500">
                                                    {v.requisitioned_by?.assignment?.designation?.designation_name || "N/A"}
                                                </div>
                                            </td>
                                            <td className="border p-2 text-sm text-gray-600">
                                                {v.product?.product_name}
                                            </td>
                                            <td className="border p-2 text-right text-sm font-medium text-gray-900">
                                                {v.requisitioned_quantity}
                                            </td>
                                            <td className="border p-2">
                                                {v.allowed_by_head === "Yes" ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className="flex items-center gap-1 text-xs font-bold uppercase text-green-600">
                                                            <CheckCircle2 size={14} />
                                                            Head: Approved
                                                        </span>
                                                        {v.issued_by_storeman === "Yes" && (
                                                            <span className="flex items-center gap-1 text-xs font-bold uppercase text-blue-600">
                                                                <CheckCircle2 size={14} />
                                                                Store: Issued ({v.issued_quantity})
                                                            </span>
                                                        )}
                                                        {v.issued_by_storeman === "Cancelled" && (
                                                            <span className="flex items-center gap-1 text-xs font-bold uppercase text-red-600">
                                                                <AlertCircle size={14} />
                                                                Store: Cancelled
                                                            </span>
                                                        )}
                                                        {v.storeman_comment && (
                                                            <span className="text-[10px] text-gray-500 italic bg-gray-50 p-1 rounded border">
                                                                Note: {v.storeman_comment}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-xs font-bold uppercase text-red-600">
                                                        <AlertCircle size={14} />
                                                        Head: {v.allowed_by_head}
                                                    </span>
                                                )}
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
