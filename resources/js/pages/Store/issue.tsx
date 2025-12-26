import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { useState } from "react";
import axios from "axios"; // 💡 Import axios for fetching the preview HTML

export default function StoremanIssue({ pendingGrouped, issuedGrouped }: any) {
    const [selected, setSelected] = useState<any>(null);
    // 💡 New state for PDF preview modal
    const [preview, setPreview] = useState<{ employee_id: number, date: string, html: string } | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
// 🔍 Filters for Issued Items
    const [filterDate, setFilterDate] = useState("");
    const [searchName, setSearchName] = useState("");

    const filteredIssued = issuedGrouped.filter((group: any) => {
        const matchDate = filterDate ? group.date === filterDate : true;
        const matchName = searchName
            ? group.employee_name?.toLowerCase().includes(searchName.toLowerCase())
            : true;

        return matchDate && matchName;
    });


    const { data, setData, post, processing, errors, reset } = useForm({
        sl_no: "",
        book_no: "",
        receiver: "",
        issued_quantity: "",
        specification: "",
        budget_code: "",
    });

    const submit = () => {
        // ... (submit logic remains the same)
        post(route("voucher.storeman.issue", selected.id), {
            onSuccess: () => {
                reset();
                setSelected(null);
            },
        });
    };

    const exportVoucher = async (employee_id: number, date: string) => {
        setPreviewLoading(true);
        const url = route('voucher.preview', [employee_id, date]);

        try {
            const response = await axios.get(url);
            setPreview({ employee_id, date, html: response.data.html });
        } catch (error) {
            console.error('Error fetching voucher preview:', error);
            // Handle error, e.g., show a simple error message in the modal
            setPreview({ employee_id, date, html: '<h2>Error loading preview.</h2>' });
        } finally {
            setPreviewLoading(false);
        }
    };

    const printPdf = () => {
        if (preview) {
            // Open the PDF stream route in a new tab
            window.open(route('voucher.stream.pdf', [preview.employee_id, preview.date]), '_blank');
        }
    };

    return (
        <AppLayout>
            <Head title="Store Issue" />

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ... (LEFT — PENDING section remains the same) ... */}
                <div className="bg-white p-5 rounded shadow">
                    <h2 className="font-semibold mb-3">Pending Issues</h2>

                    {pendingGrouped.map((group, idx) => (
                        <div key={idx} className="mb-4">
                            <h3 className="font-semibold">{group.employee_name} — {group.date}</h3>
                            <table className="w-full border mb-2">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 border">Product</th>
                                    <th className="p-2 border">Req Qty</th>
                                    <th className="p-2 border">Action</th>
                                </tr>
                                </thead>
                                <tbody>
                                {group.items.map((v:any) => (
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
                    ))}
                </div>


                {/* RIGHT — ISSUED */}
                {/* RIGHT — ISSUED */}
                <div className="bg-white p-5 rounded shadow">
                    <h2 className="font-semibold mb-3">Issued Items</h2>

                    {/* 🔍 Filters */}
                    <div className="flex flex-wrap gap-3 mb-4">
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="border rounded px-3 py-1 text-sm"
                        />

                        <input
                            type="text"
                            placeholder="Search by employee name"
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="border rounded px-3 py-1 text-sm w-full md:w-64"
                        />

                        {(filterDate || searchName) && (
                            <button
                                onClick={() => {
                                    setFilterDate("");
                                    setSearchName("");
                                }}
                                className="text-sm text-red-600 underline"
                            >
                                Clear
                            </button>
                        )}
                    </div>

                    {filteredIssued.map((group, idx) => (
                        <div key={idx} className="mb-4">
                            <h3 className="font-semibold">{group.employee_name} — {group.date}</h3>
                            <table className="w-full border mb-2">
                                <thead className="bg-gray-100">
                                <tr>
                                    <th className="p-2 border">Product</th>
                                    <th className="p-2 border">Issued</th>
                                    <th className="p-2 border">Date</th>
                                </tr>
                                </thead>
                                <tbody>
                                {group.items.map((v:any) => (
                                    <tr key={v.id}>
                                        <td className="p-2 border">{v.product.product_name}</td>
                                        <td className="p-2 border">{v.issued_quantity}</td>
                                        <td className="p-2 border">{v.date}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>

                            <button
                                onClick={() => exportVoucher(group.employee_id, group.date)}
                                className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                                disabled={previewLoading}
                            >
                                {previewLoading ? 'Loading Preview...' : 'Export Voucher'}
                            </button>
                        </div>
                    ))}
                </div>
            </div>


            {/* ISSUE MODAL (Remains the same) */}
            {selected && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
                    {/* ... (modal content) ... */}
                    <div className="bg-white p-6 rounded w-full max-w-lg">
                        <h3 className="font-semibold mb-3">Issue Item</h3>

                        {["sl_no","book_no","receiver","issued_quantity","budget_code","specification"].map(f => (
                            <input
                                key={f}
                                placeholder={f.replace('_', ' ')}
                                className="input mb-2 w-full border"
                                value={(data as any)[f]}
                                onChange={e => setData(f as any, e.target.value)}
                            />
                        ))}

                        <div className="flex justify-end gap-2">
                            <button onClick={() => setSelected(null)} className="px-4 py-1 rounded border">Cancel</button>
                            <button
                                onClick={submit}
                                disabled={processing}
                                className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:opacity-50"
                            >
                                Issue
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 💡 PDF PREVIEW MODAL */}
            {preview && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                        <h3 className="text-lg font-semibold mb-3 border-b pb-2">Voucher Preview for {preview.employee_id} on {preview.date}</h3>

                        {/* Preview Area */}
                        <div className="flex-grow overflow-y-auto border p-4 bg-gray-50">
                            {/* Dangerously set the inner HTML from the controller response */}
                            <div dangerouslySetInnerHTML={{ __html: preview.html }} />
                        </div>

                        {/* Modal Footer */}
                        <div className="flex justify-end gap-2 mt-4">
                            <button
                                onClick={() => setPreview(null)}
                                className="px-4 py-2 rounded border hover:bg-gray-100"
                            >
                                Close Preview
                            </button>
                            <button
                                onClick={printPdf}
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                            >
                                Print to PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
