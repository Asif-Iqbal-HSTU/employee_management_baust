import React from "react";
import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";
import { useState, useEffect } from "react";
import axios from "axios"; // 💡 Import axios for fetching the preview HTML
import { X, GripHorizontal, Package, User, Hash, FileText, ShoppingBag, CreditCard } from "lucide-react";

export default function StoremanIssue({ pendingGrouped, issuedGrouped }: any) {
    const [selected, setSelected] = useState<any>(null);
    // 💡 New state for PDF preview modal
    const [preview, setPreview] = useState<{ employee_id: number, date: string, html: string } | null>(null);
    const [previewLoading, setPreviewLoading] = useState(false);
    // 🔍 Filters for Issued Items
    const [filterDate, setFilterDate] = useState("");
    const [searchName, setSearchName] = useState("");

    // 🖱️ Draggable Modal State
    const [modalPos, setModalPos] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (selected) {
            // Reset position when modal opens
            setModalPos({ x: 0, y: 0 });
        }
    }, [selected]);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragOffset({
            x: e.clientX - modalPos.x,
            y: e.clientY - modalPos.y
        });
    };

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setModalPos({
                    x: e.clientX - dragOffset.x,
                    y: e.clientY - dragOffset.y
                });
            }
        };
        const handleMouseUp = () => setIsDragging(false);

        if (isDragging) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isDragging, dragOffset]);

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

                    {pendingGrouped.map((group: any, idx: number) => (
                        <div key={idx} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {/* Header Info */}
                            <div className="mb-3">
                                <h3 className="font-bold text-lg text-indigo-700">{group.employee_name}</h3>
                                <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    <span><span className="font-medium text-gray-800">ID:</span> {group.employee_id}</span>
                                    <span><span className="font-medium text-gray-800">Dept:</span> {group.department_name}</span>
                                    <span><span className="font-medium text-gray-800">Designation:</span> {group.employee_designation}</span>
                                    <span><span className="font-medium text-gray-800">Date:</span> {group.date}</span>
                                </div>
                            </div>

                            <table className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden text-sm">
                                <thead className="bg-gray-100 text-gray-700 uppercase leading-normal">
                                    <tr>
                                        <th className="py-2 px-3 text-left">Product</th>
                                        <th className="py-2 px-3 text-center">Req Qty</th>
                                        <th className="py-2 px-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 font-light">
                                    {group.items.map((v: any) => (
                                        <tr key={v.id} className="border-b border-gray-200 hover:bg-gray-100">
                                            <td className="py-2 px-3 text-left whitespace-nowrap font-medium text-gray-700">
                                                {v.product.product_name}
                                            </td>
                                            <td className="py-2 px-3 text-center font-bold">
                                                {v.requisitioned_quantity}
                                            </td>
                                            <td className="py-2 px-3 text-center">
                                                <button
                                                    onClick={() => setSelected(v)}
                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white py-1 px-3 rounded shadow-sm text-xs transition duration-200 ease-in-out transform hover:scale-105"
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

                    {filteredIssued.map((group: any, idx: number) => (
                        <div key={idx} className="mb-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
                            {/* Header Info */}
                            <div className="mb-3">
                                <h3 className="font-bold text-lg text-green-700">{group.employee_name}</h3>
                                <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 mt-1">
                                    <span><span className="font-medium text-gray-800">ID:</span> {group.employee_id}</span>
                                    <span><span className="font-medium text-gray-800">Dept:</span> {group.department_name}</span>
                                    <span><span className="font-medium text-gray-800">Designation:</span> {group.employee_designation}</span>
                                    <span><span className="font-medium text-gray-800">Date:</span> {group.date}</span>
                                </div>
                            </div>

                            <table className="w-full bg-white border border-gray-200 rounded-lg overflow-hidden text-sm mb-3">
                                <thead className="bg-gray-100 text-gray-700 uppercase leading-normal">
                                    <tr>
                                        <th className="py-2 px-3 text-left">Product</th>
                                        <th className="py-2 px-3 text-center">Issued</th>
                                        <th className="py-2 px-3 text-center">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="text-gray-600 font-light">
                                    {group.items.map((v: any) => (
                                        <tr key={v.id} className="border-b border-gray-200 hover:bg-gray-100">
                                            <td className="py-2 px-3 text-left whitespace-nowrap font-medium text-gray-700">
                                                {v.product.product_name}
                                            </td>
                                            <td className="py-2 px-3 text-center font-bold">
                                                {v.issued_quantity}
                                            </td>
                                            <td className="py-2 px-3 text-center text-xs">
                                                {v.date}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            <div className="flex justify-end">
                                <button
                                    onClick={() => exportVoucher(group.employee_id, group.date)}
                                    className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 text-sm shadow-sm flex items-center gap-2 transition-colors"
                                    disabled={previewLoading}
                                >
                                    {previewLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating PDF...
                                        </>
                                    ) : (
                                        'Export Voucher PDF'
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            {/* ISSUE MODAL - Modern & Draggable */}
            {selected && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-40">
                    <div
                        className="bg-white rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden border border-gray-100"
                        style={{
                            transform: `translate(${modalPos.x}px, ${modalPos.y}px)`,
                            cursor: isDragging ? 'grabbing' : 'default'
                        }}
                    >
                        {/* Draggable Header */}
                        <div
                            className="bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-500 px-6 py-4 flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
                            onMouseDown={handleMouseDown}
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 rounded-lg p-2">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg text-white">Issue Item</h3>
                                    <p className="text-indigo-100 text-sm">Complete the form to issue this product</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <GripHorizontal className="w-5 h-5 text-white/60" />
                                <button
                                    onClick={() => setSelected(null)}
                                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>
                        </div>

                        {/* Product Info Banner */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b border-indigo-100">
                            <div className="flex items-center gap-4">
                                <div className="bg-white rounded-lg p-2 shadow-sm">
                                    <ShoppingBag className="w-5 h-5 text-indigo-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Product</p>
                                    <p className="font-semibold text-gray-800">{selected.product?.product_name || 'N/A'}</p>
                                </div>
                                <div className="ml-auto bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium">
                                    Req: {selected.requisitioned_quantity}
                                </div>
                            </div>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                {/* SL No */}
                                <div className="relative">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                        SL No
                                    </label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter SL number"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            value={data.sl_no}
                                            onChange={e => setData('sl_no', e.target.value)}
                                        />
                                    </div>
                                    {errors.sl_no && <p className="text-red-500 text-xs mt-1">{errors.sl_no}</p>}
                                </div>

                                {/* Book No */}
                                <div className="relative">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                        Book No
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter book number"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            value={data.book_no}
                                            onChange={e => setData('book_no', e.target.value)}
                                        />
                                    </div>
                                    {errors.book_no && <p className="text-red-500 text-xs mt-1">{errors.book_no}</p>}
                                </div>
                            </div>

                            {/* Receiver */}
                            <div className="relative">
                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                    Receiver
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Enter receiver name"
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                        value={data.receiver}
                                        onChange={e => setData('receiver', e.target.value)}
                                    />
                                </div>
                                {errors.receiver && <p className="text-red-500 text-xs mt-1">{errors.receiver}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {/* Issued Quantity */}
                                <div className="relative">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                        Issued Quantity
                                    </label>
                                    <div className="relative">
                                        <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="number"
                                            placeholder="Quantity to issue"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            value={data.issued_quantity}
                                            onChange={e => setData('issued_quantity', e.target.value)}
                                        />
                                    </div>
                                    {errors.issued_quantity && <p className="text-red-500 text-xs mt-1">{errors.issued_quantity}</p>}
                                </div>

                                {/* Budget Code */}
                                <div className="relative">
                                    <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                        Budget Code
                                    </label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Enter budget code"
                                            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                                            value={data.budget_code}
                                            onChange={e => setData('budget_code', e.target.value)}
                                        />
                                    </div>
                                    {errors.budget_code && <p className="text-red-500 text-xs mt-1">{errors.budget_code}</p>}
                                </div>
                            </div>

                            {/* Specification */}
                            <div className="relative">
                                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">
                                    Specification
                                </label>
                                <textarea
                                    placeholder="Enter product specification or notes..."
                                    rows={3}
                                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white resize-none"
                                    value={data.specification}
                                    onChange={e => setData('specification', e.target.value)}
                                />
                                {errors.specification && <p className="text-red-500 text-xs mt-1">{errors.specification}</p>}
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-100">
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                <GripHorizontal className="w-3 h-3" />
                                Drag header to move
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelected(null)}
                                    className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={submit}
                                    disabled={processing}
                                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 transition-all flex items-center gap-2"
                                >
                                    {processing ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Issuing...
                                        </>
                                    ) : (
                                        <>
                                            <Package className="w-4 h-4" />
                                            Issue Item
                                        </>
                                    )}
                                </button>
                            </div>
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
