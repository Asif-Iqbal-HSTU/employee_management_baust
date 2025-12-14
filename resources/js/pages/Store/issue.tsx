import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";

export default function StoremanIssue({ pending, issued }: any) {
    const [selected, setSelected] = useState<any>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        sl_no: "",
        book_no: "",
        receiver: "",
        issued_quantity: "",
        specification: "",
        budget_code: "",
    });

    const submit = () => {
        post(route("voucher.storeman.issue", selected.id), {
            onSuccess: () => {
                reset();
                setSelected(null);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Store Issue" />

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LEFT — PENDING */}
                <div className="bg-white p-5 rounded shadow">
                    <h2 className="font-semibold mb-3">Pending Issues</h2>

                    <table className="w-full border">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Product</th>
                            <th className="p-2 border">Req Qty</th>
                            <th className="p-2 border">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {pending.map((v: any) => (
                            <tr key={v.id}>
                                <td className="p-2 border">{v.product.product_name}</td>
                                <td className="p-2 border">{v.requisitioned_quantity}</td>
                                <td className="p-2 border">
                                    <button
                                        onClick={() => setSelected(v)}
                                        className="bg-blue-600 text-white px-3 py-1 rounded"
                                    >
                                        Issue
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* RIGHT — ISSUED */}
                <div className="bg-white p-5 rounded shadow">
                    <h2 className="font-semibold mb-3">Issued Items</h2>

                    <table className="w-full border">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="p-2 border">Product</th>
                            <th className="p-2 border">Issued</th>
                            <th className="p-2 border">Date</th>
                        </tr>
                        </thead>
                        <tbody>
                        {issued.map((v: any) => (
                            <tr key={v.id}>
                                <td className="p-2 border">{v.product.product_name}</td>
                                <td className="p-2 border">{v.issued_quantity}</td>
                                <td className="p-2 border">{v.updated_at}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ISSUE MODAL */}
            {selected && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center">
                    <div className="bg-white p-6 rounded w-full max-w-lg">
                        <h3 className="font-semibold mb-3">Issue Item</h3>

                        {["sl_no","book_no","receiver","issued_quantity","budget_code","specification"].map(f => (
                            <input
                                key={f}
                                placeholder={f.replace('_', ' ')}
                                className="input mb-2 w-full"
                                value={(data as any)[f]}
                                onChange={e => setData(f as any, e.target.value)}
                            />
                        ))}

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setSelected(null)}>Cancel</button>
                            <button
                                onClick={submit}
                                disabled={processing}
                                className="bg-green-600 text-white px-4 py-1 rounded"
                            >
                                Issue
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
