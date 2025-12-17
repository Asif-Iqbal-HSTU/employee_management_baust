import SearchableSelect from '@/components/SearchableSelect';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { PlusCircle } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

export default function ProductOfCategory({ products, category, vendors }: any) {
    const auth = usePage().props.auth.user;
    console.log(auth.employee_id);
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Categories of Store Products', href: '/categories' }];

    // ----------------------------- ADD PRODUCT MODAL CONTROL -----------------------------
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // ----------------------------- FORM SETUP -----------------------------
    const { data, setData, post, processing, errors, reset } = useForm({
        store_category_id: category.id,
        product_name: '',
        stock_unit_name: '',
        stock_unit_number: '',
        product_image: null as File | null,
    });

    // ----------------------------- RECEIVE PRODUCT MODAL CONTROL -----------------------------
    const [showReceiveModal, setShowReceiveModal] = useState(false);

    // RECEIVE FORM
    const receiveForm = useForm({
        store_product_id: null,
        date_of_receive: '',
        from_whom: '',
        memo_no: '',
        memo_date: '',
        office_order_no: '',
        rate: '',
        quantity: '',
        warranty_information: '',
    });

    const [showIssueModal, setShowIssueModal] = useState(false);

    const issueForm = useForm({
        store_product_id: null,
        date_of_issue: '',
        quantity: '',
        issued_to: '',
        office_order_no: '',
    });

    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [previewProduct, setPreviewProduct] = useState<any>(null);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('store.products.store'), {
            forceFormData: true, // Important for image upload
            onSuccess: () => {
                toast.success('Product created successfully!');

                // Show success modal
                setShowSuccessModal(true);

                // Reset only the fields, keep modal open
                reset('product_name', 'stock_unit_name', 'stock_unit_number', 'product_image');
            },
        });
    };

    const [showVendorModal, setShowVendorModal] = useState(false);
    const vendorForm = useForm({
        vendor_name: '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Store Products" />

            <div className="p-6">
                {/* Header */}
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-xl font-bold">{category.category_name}</h1>

                    {(auth.employee_id === '15302' || auth.employee_id === '19001') && (
                        <div className="flex gap-3">
                            <button onClick={() => setShowAddModal(true)} className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700">
                                + Add Product
                            </button>

                            <button
                                onClick={() => setShowVendorModal(true)}
                                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                            >
                                + Add Vendor
                            </button>
                        </div>
                    )}
                </div>

                {/* Product List */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {products.map((product: any) => (
                        <div key={product.id} className="bg-card rounded-xl border p-6 shadow-sm transition hover:shadow-md">
                            <h2 className="text-lg font-semibold">{product.product_name}</h2>
                            <p className="text-sm text-gray-600">
                                Stock: {product.stock_unit_number} {product.stock_unit_name}
                            </p>

                            {(auth.employee_id == 15302 || auth.employee_id == 19001) && (
                                <div className="mt-4 flex justify-between">
                                    {/* Receive Button */}
                                    <button
                                        onClick={() => {
                                            receiveForm.setData('store_product_id', product.id);
                                            setShowReceiveModal(true);
                                        }}
                                        className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm text-white hover:bg-green-700"
                                    >
                                        <PlusCircle size={16} /> Receive
                                    </button>

                                    <button
                                        onClick={() => {
                                            setPreviewProduct(product);
                                            setShowPreviewModal(true);
                                        }}
                                        className="rounded-lg bg-gray-600 px-3 py-1.5 text-sm text-white hover:bg-gray-700"
                                    >
                                        Preview
                                    </button>

                                    {/* Issue Button */}
                                    {/*<button
                                    onClick={() => {
                                        issueForm.setData("store_product_id", product.id);
                                        setShowIssueModal(true);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                    <MinusCircle size={16} /> Issue
                                </button>*/}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {showVendorModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                        <div className="mb-4 flex justify-between">
                            <h2 className="text-lg font-bold">Add Vendor</h2>
                            <button onClick={() => setShowVendorModal(false)}>✖</button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                vendorForm.post(route('product-vendors.store'), {
                                    onSuccess: () => {
                                        vendorForm.reset();
                                        setShowVendorModal(false);
                                    },
                                });
                            }}
                            className="space-y-4"
                        >
                            <div>
                                <label className="block font-medium">Vendor Name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    value={vendorForm.data.vendor_name}
                                    onChange={(e) => vendorForm.setData('vendor_name', e.target.value)}
                                />
                                {vendorForm.errors.vendor_name && <p className="text-sm text-red-500">{vendorForm.errors.vendor_name}</p>}
                            </div>

                            <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                                Save Vendor
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------------------- ADD PRODUCT MODAL ----------------------------- */}
            {showAddModal && (
                <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    {/*<button
                        type="button"
                        onClick={() => setShowVendorModal(true)}
                        className="mt-1 text-xs text-blue-600 underline"
                    >
                        + Add new vendor
                    </button>*/}

                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Add New Product</h2>
                            <button onClick={() => setShowAddModal(false)}>✖</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Product Name */}
                            <div>
                                <label className="block font-medium">Product Name</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    value={data.product_name}
                                    onChange={(e) => setData('product_name', e.target.value)}
                                />
                                {errors.product_name && <p className="text-sm text-red-500">{errors.product_name}</p>}
                            </div>

                            {/* Stock Unit Name */}
                            <div>
                                <label className="block font-medium">Stock Unit Name</label>
                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={data.stock_unit_name}
                                    onChange={(e) => setData('stock_unit_name', e.target.value)}
                                    size={5} // <-- shows 5 options at once, scrollable if more
                                >
                                    <option value="">Select Unit</option>
                                    <option value="Dozen">Dozen</option>
                                    <option value="Piece">Piece</option>
                                    <option value="Box">Box</option>
                                    <option value="Coil">Coil</option>
                                    <option value="Ream">Ream</option>
                                    <option value="Pair">Pair</option>
                                    <option value="Set">Set</option>
                                    <option value="Book">Book</option>
                                    <option value="Packet">Packet</option>
                                    <option value="Litre">Litre</option>
                                </select>
                                {errors.stock_unit_name && <p className="text-sm text-red-500">{errors.stock_unit_name}</p>}
                            </div>



                            {/* Stock Unit Number */}
                            <div>
                                <label className="block font-medium">Stock Unit Number</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border p-2"
                                    value={data.stock_unit_number}
                                    onChange={(e) => setData('stock_unit_number', e.target.value)}
                                />
                                {errors.stock_unit_number && <p className="text-sm text-red-500">{errors.stock_unit_number}</p>}
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block font-medium">Product Image (optional)</label>
                                <input type="file" accept="image/*" onChange={(e) => setData('product_image', e.target.files?.[0] || null)} />
                                {errors.product_image && <p className="text-sm text-red-500">{errors.product_image}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-60"
                            >
                                {processing ? 'Saving...' : 'Add Product'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showReceiveModal && (
                <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="flex max-h-[90vh] w-full max-w-3xl flex-col rounded-xl bg-white shadow-lg">
                        <div className="mb-4 flex items-center justify-between border-b p-6">
                            <h2 className="text-lg font-bold">Receive Product Entry</h2>
                            <button onClick={() => setShowReceiveModal(false)}>✖</button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                receiveForm.post(route('store.receive.store'), {
                                    onSuccess: () => {
                                        toast.success('Receive entry added!');
                                        setShowReceiveModal(false);
                                        receiveForm.reset();
                                    },
                                });
                            }}
                            className="space-y-4 overflow-y-auto p-6"
                        >
                            {/* Date of Receive */}
                            <div>
                                <label className="block font-medium">Date of Receive</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border p-2"
                                    value={receiveForm.data.date_of_receive}
                                    onChange={(e) => receiveForm.setData('date_of_receive', e.target.value)}
                                />
                                {receiveForm.errors.date_of_receive && <p className="text-sm text-red-500">{receiveForm.errors.date_of_receive}</p>}
                            </div>

                            {/* From Whom */}
                            {/*<div>
                                <label className="block font-medium">From Whom</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    value={receiveForm.data.from_whom}
                                    onChange={(e) => receiveForm.setData('from_whom', e.target.value)}
                                />
                                {receiveForm.errors.from_whom && <p className="text-sm text-red-500">{receiveForm.errors.from_whom}</p>}
                            </div>*/}

                            {/*<div>
                                <label className="block font-medium">From Whom</label>

                                <select
                                    className="w-full rounded-lg border p-2"
                                    value={receiveForm.data.from_whom}
                                    onChange={(e) =>
                                        receiveForm.setData('from_whom', e.target.value)
                                    }
                                >
                                    <option value="">-- Select Vendor --</option>

                                    {vendors.map((vendor) => (
                                        <option key={vendor.id} value={vendor.vendor_name}>
                                            {vendor.vendor_name}
                                        </option>
                                    ))}
                                </select>

                                {receiveForm.errors.from_whom && (
                                    <p className="text-sm text-red-500">
                                        {receiveForm.errors.from_whom}
                                    </p>
                                )}
                            </div>*/}

                            <div>
                                <label className="block font-medium">From Whom</label>

                                <SearchableSelect
                                    items={vendors}
                                    value={receiveForm.data.from_whom}
                                    onChange={(val: any) => receiveForm.setData('from_whom', val)}
                                    placeholder="Select Vendor"
                                    labelKey="vendor_name"
                                    valueKey="vendor_name"
                                />

                                {receiveForm.errors.from_whom && <p className="text-sm text-red-500">{receiveForm.errors.from_whom}</p>}
                            </div>

                            {/* Memo No */}
                            <div>
                                <label className="block font-medium">Memo No</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    value={receiveForm.data.memo_no}
                                    onChange={(e) => receiveForm.setData('memo_no', e.target.value)}
                                />
                                {receiveForm.errors.memo_no && <p className="text-sm text-red-500">{receiveForm.errors.memo_no}</p>}
                            </div>

                            {/* Memo Date */}
                            <div>
                                <label className="block font-medium">Memo Date</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border p-2"
                                    value={receiveForm.data.memo_date}
                                    onChange={(e) => receiveForm.setData('memo_date', e.target.value)}
                                />
                                {receiveForm.errors.memo_date && <p className="text-sm text-red-500">{receiveForm.errors.memo_date}</p>}
                            </div>

                            {/* Office Order No */}
                            <div>
                                <label className="block font-medium">Office Order No</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    value={receiveForm.data.office_order_no}
                                    onChange={(e) => receiveForm.setData('office_order_no', e.target.value)}
                                />
                                {receiveForm.errors.office_order_no && <p className="text-sm text-red-500">{receiveForm.errors.office_order_no}</p>}
                            </div>

                            {/* Rate */}
                            <div>
                                <label className="block font-medium">Rate</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border p-2"
                                    value={receiveForm.data.rate}
                                    onChange={(e) => receiveForm.setData('rate', e.target.value)}
                                />
                                {receiveForm.errors.rate && <p className="text-sm text-red-500">{receiveForm.errors.rate}</p>}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block font-medium">Quantity</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border p-2"
                                    value={receiveForm.data.quantity}
                                    onChange={(e) => receiveForm.setData('quantity', e.target.value)}
                                />
                                {receiveForm.errors.quantity && <p className="text-sm text-red-500">{receiveForm.errors.quantity}</p>}
                            </div>

                            {/* Warranty Info */}
                            <div>
                                <label className="block font-medium">Warranty Information (optional)</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    value={receiveForm.data.warranty_information}
                                    onChange={(e) => receiveForm.setData('warranty_information', e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={receiveForm.processing}
                                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-60"
                            >
                                {receiveForm.processing ? 'Saving...' : 'Add Receive Entry'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showIssueModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-lg">
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-lg font-bold">Issue Product</h2>
                            <button onClick={() => setShowIssueModal(false)}>✖</button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                issueForm.post(route('store.issue.store'), {
                                    onSuccess: () => {
                                        toast.success('Product Issued Successfully!');
                                        setShowIssueModal(false);
                                        issueForm.reset();
                                    },
                                });
                            }}
                            className="space-y-4"
                        >
                            {/* Date of Issue */}
                            <div>
                                <label className="block font-medium">Date of Issue</label>
                                <input
                                    type="date"
                                    className="w-full rounded-lg border p-2"
                                    value={issueForm.data.date_of_issue}
                                    onChange={(e) => issueForm.setData('date_of_issue', e.target.value)}
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block font-medium">Quantity</label>
                                <input
                                    type="number"
                                    className="w-full rounded-lg border p-2"
                                    value={issueForm.data.quantity}
                                    onChange={(e) => issueForm.setData('quantity', e.target.value)}
                                />
                            </div>

                            {/* Issued To */}
                            <div>
                                <label className="block font-medium">Issued To (Name/Dept)</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    value={issueForm.data.issued_to}
                                    onChange={(e) => issueForm.setData('issued_to', e.target.value)}
                                />
                            </div>

                            {/* Office Order No */}
                            <div>
                                <label className="block font-medium">Office Order No</label>
                                <input
                                    type="text"
                                    className="w-full rounded-lg border p-2"
                                    value={issueForm.data.office_order_no}
                                    onChange={(e) => issueForm.setData('office_order_no', e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={issueForm.processing}
                                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {issueForm.processing ? 'Saving...' : 'Submit Issue'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* ----------------------------- SUCCESS MODAL ----------------------------- */}
            {showSuccessModal && (
                <div className="bg-opacity-40 fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                    <div className="w-full max-w-md rounded-xl bg-white p-6 text-center shadow-lg">
                        <h2 className="mb-4 text-lg font-bold">Product Added Successfully!</h2>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="mt-4 rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}

            {showPreviewModal && previewProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="flex max-h-[90vh] w-full max-w-6xl flex-col rounded-xl bg-white shadow-lg">
                        <div className="border-b p-6">
                            <div className="mb-3 flex justify-end gap-2">
                                <a
                                    href={route('store.product.stock.print', previewProduct.id)}
                                    target="_blank"
                                    className="rounded bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                                >
                                    🖨 Print Stock Register
                                </a>
                            </div>

                            <div className="text-center">
                                <h1 className="text-lg font-bold">Bangladesh Army University of Science and Technology (BAUST)</h1>
                                <p className="text-sm font-semibold underline">Stock Register</p>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
                                <p>
                                    <b>Name of Article:</b> {previewProduct.product_name}
                                </p>
                                <p>
                                    <b>Unit:</b> {previewProduct.stock_unit_name}
                                </p>
                                <p>
                                    <b>Budget Code:</b> —
                                </p>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto p-6">
                            <div className="overflow-x-auto">
                                <table className="w-full border border-black text-xs">
                                    <thead>
                                        <tr className="border border-black">
                                            <th colSpan={7} className="border border-black p-1 text-center font-bold">
                                                RECEIVED ARTICLES
                                            </th>
                                            <th colSpan={8} className="border border-black p-1 text-center font-bold">
                                                ISSUE ARTICLE
                                            </th>
                                        </tr>

                                        <tr>
                                            {/* Received */}
                                            <th className="border p-1">Date of Receiving</th>
                                            <th className="border p-1">From Whom Received (Memo No & Date)</th>
                                            <th className="border p-1">Description</th>
                                            <th className="border p-1">Office Order No</th>
                                            <th className="border p-1">Rate</th>
                                            <th className="border p-1">Quantity</th>
                                            <th className="border p-1">Warranty Info</th>

                                            {/* Issue */}
                                            <th className="border p-1">Date of Issue</th>
                                            <th className="border p-1">To Whom Issued</th>
                                            <th className="border p-1">Issue Voucher No & Date</th>
                                            <th className="border p-1">Qty Issued</th>
                                            <th className="border p-1">Balance Stock</th>
                                            <th className="border p-1">Receiver Name, Dept & Office</th>
                                            <th className="border p-1">Officer In Charge</th>
                                            <th className="border p-1">Remarks</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {(() => {
                                            let balance = 0;

                                            // 🔹 1. Normalize receives
                                            const receiveEvents = previewProduct.receives.map((r: any) => ({
                                                type: 'receive',
                                                date: r.date_of_receive,
                                                data: r,
                                            }));

                                            // 🔹 2. Normalize issues
                                            const issueEvents = previewProduct.issues.map((i: any) => ({
                                                type: 'issue',
                                                date: i.date_of_issue,
                                                data: i,
                                            }));

                                            // 🔹 3. Merge + sort chronologically
                                            const events = [...receiveEvents, ...issueEvents].sort(
                                                (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
                                            );

                                            if (events.length === 0) {
                                                return (
                                                    <tr>
                                                        <td colSpan={15} className="border p-2 text-center">
                                                            No data yet
                                                        </td>
                                                    </tr>
                                                );
                                            }

                                            // 🔹 4. Render rows in time order
                                            return events.map((event, idx) => {
                                                /* ================= RECEIVE ================= */
                                                if (event.type === 'receive') {
                                                    const r = event.data;
                                                    balance += Number(r.quantity || 0);

                                                    return (
                                                        <tr key={`receive-${idx}`}>
                                                            {/* RECEIVED */}
                                                            <td className="border p-1">{r.date_of_receive}</td>
                                                            <td className="border p-1">
                                                                {r.from_whom}
                                                                <br />
                                                                <span className="text-[10px]">
                                                                    Memo: {r.memo_no} ({r.memo_date})
                                                                </span>
                                                            </td>
                                                            <td className="border p-1">{previewProduct.product_name}</td>
                                                            <td className="border p-1">{r.office_order_no}</td>
                                                            <td className="border p-1 text-right">{r.rate}</td>
                                                            <td className="border p-1 text-right">{r.quantity}</td>
                                                            <td className="border p-1">{r.warranty_information}</td>

                                                            {/* ISSUE (EMPTY) */}
                                                            <td className="border p-1"></td>
                                                            <td className="border p-1"></td>
                                                            <td className="border p-1"></td>
                                                            <td className="border p-1"></td>
                                                            <td className="border p-1 text-right">{balance}</td>
                                                            <td className="border p-1"></td>
                                                            <td className="border p-1"></td>
                                                            <td className="border p-1"></td>
                                                        </tr>
                                                    );
                                                }

                                                /* ================= ISSUE ================= */
                                                const i = event.data;
                                                balance -= Number(i.issued_quantity || 0);

                                                return (
                                                    <tr key={`issue-${idx}`}>
                                                        {/* RECEIVED (EMPTY) */}
                                                        <td className="border p-1"></td>
                                                        <td className="border p-1"></td>
                                                        <td className="border p-1"></td>
                                                        <td className="border p-1"></td>
                                                        <td className="border p-1"></td>
                                                        <td className="border p-1"></td>
                                                        <td className="border p-1"></td>

                                                        {/* ISSUE */}
                                                        <td className="border p-1">{i.date_of_issue}</td>
                                                        <td className="border p-1">{i.voucher?.requisitioned_by?.name}</td>
                                                        <td className="border p-1">
                                                            {i.voucher?.sl_no}
                                                            <br />
                                                            <span className="text-[10px]">{i.voucher?.date}</span>
                                                        </td>
                                                        <td className="border p-1 text-right">{i.issued_quantity}</td>
                                                        <td className="border p-1 text-right">{balance}</td>
                                                        <td className="border p-1">
                                                            {i.voucher?.receiver}
                                                            <br />
                                                            <span className="text-[10px]">{i.voucher?.department?.dept_name}</span>
                                                        </td>
                                                        <td className="border p-1"></td>
                                                        <td className="border p-1"></td>
                                                    </tr>
                                                );
                                            });
                                        })()}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t p-4 text-right">
                            <button
                                onClick={() => setShowPreviewModal(false)}
                                className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                            >
                                Close
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </AppLayout>
    );
}
