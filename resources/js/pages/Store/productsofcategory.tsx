import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import React, { useState } from "react";
import { toast } from "sonner";
import { PlusCircle, MinusCircle } from "lucide-react";


export default function ProductOfCategory({ products, category }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Categories of Store Products", href: "/categories" },
    ];

    // ----------------------------- ADD PRODUCT MODAL CONTROL -----------------------------
    const [showAddModal, setShowAddModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // ----------------------------- FORM SETUP -----------------------------
    const { data, setData, post, processing, errors, reset } = useForm({
        store_category_id: category.id,
        product_name: "",
        stock_unit_name: "",
        stock_unit_number: "",
        product_image: null as File | null,
    });

    // ----------------------------- RECEIVE PRODUCT MODAL CONTROL -----------------------------
    const [showReceiveModal, setShowReceiveModal] = useState(false);

    // RECEIVE FORM
    const receiveForm = useForm({
        store_product_id: null,
        date_of_receive: "",
        from_whom: "",
        memo_no: "",
        memo_date: "",
        office_order_no: "",
        rate: "",
        quantity: "",
        warranty_information: "",
    });

    const [showIssueModal, setShowIssueModal] = useState(false);

    const issueForm = useForm({
        store_product_id: null,
        date_of_issue: "",
        quantity: "",
        issued_to: "",
        office_order_no: "",
    });


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route("store.products.store"), {
            forceFormData: true, // Important for image upload
            onSuccess: () => {
                toast.success("Product created successfully!");

                // Show success modal
                setShowSuccessModal(true);

                // Reset only the fields, keep modal open
                reset("product_name", "stock_unit_name", "stock_unit_number", "product_image");
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Store Products" />

            <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold">{category.category_name}</h1>

                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                        >
                            + Add Product
                        </button>
                    </div>

                </div>

                {/* Product List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {products.map((product: any) => (
                        <div
                            key={product.id}
                            className="rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition"
                        >
                            <h2 className="text-lg font-semibold">{product.product_name}</h2>
                            <p className="text-sm text-gray-600">
                                Stock: {product.stock_unit_number} {product.stock_unit_name}
                            </p>

                            <div className="flex justify-between mt-4">
                                {/* Receive Button */}
                                <button
                                    onClick={() => {
                                        receiveForm.setData("store_product_id", product.id);
                                        setShowReceiveModal(true);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                                >
                                    <PlusCircle size={16} /> Receive
                                </button>

                                {/* Issue Button */}
                                <button
                                    onClick={() => {
                                        issueForm.setData("store_product_id", product.id);
                                        setShowIssueModal(true);
                                    }}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
                                >
                                    <MinusCircle size={16} /> Issue
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

            </div>

            {/* ----------------------------- ADD PRODUCT MODAL ----------------------------- */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/30 bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Add New Product</h2>
                            <button onClick={() => setShowAddModal(false)}>✖</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Product Name */}
                            <div>
                                <label className="block font-medium">Product Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={data.product_name}
                                    onChange={(e) =>
                                        setData("product_name", e.target.value)
                                    }
                                />
                                {errors.product_name && (
                                    <p className="text-red-500 text-sm">{errors.product_name}</p>
                                )}
                            </div>

                            {/* Stock Unit Name */}
                            <div>
                                <label className="block font-medium">Stock Unit Name</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    placeholder="Pieces / Kg / Liters / Box"
                                    value={data.stock_unit_name}
                                    onChange={(e) =>
                                        setData("stock_unit_name", e.target.value)
                                    }
                                />
                                {errors.stock_unit_name && (
                                    <p className="text-red-500 text-sm">{errors.stock_unit_name}</p>
                                )}
                            </div>

                            {/* Stock Unit Number */}
                            <div>
                                <label className="block font-medium">Stock Unit Number</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    value={data.stock_unit_number}
                                    onChange={(e) =>
                                        setData("stock_unit_number", e.target.value)
                                    }
                                />
                                {errors.stock_unit_number && (
                                    <p className="text-red-500 text-sm">
                                        {errors.stock_unit_number}
                                    </p>
                                )}
                            </div>

                            {/* Image Upload */}
                            <div>
                                <label className="block font-medium">Product Image (optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) =>
                                        setData("product_image", e.target.files?.[0] || null)
                                    }
                                />
                                {errors.product_image && (
                                    <p className="text-red-500 text-sm">{errors.product_image}</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                            >
                                {processing ? "Saving..." : "Add Product"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showReceiveModal && (
                <div className="fixed inset-0 bg-black/30 bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Receive Product Entry</h2>
                            <button onClick={() => setShowReceiveModal(false)}>✖</button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                receiveForm.post(route("store.receive.store"), {
                                    onSuccess: () => {
                                        toast.success("Receive entry added!");
                                        setShowReceiveModal(false);
                                        receiveForm.reset();
                                    },
                                });
                            }}
                            className="space-y-4"
                        >
                            {/* Date of Receive */}
                            <div>
                                <label className="block font-medium">Date of Receive</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg p-2"
                                    value={receiveForm.data.date_of_receive}
                                    onChange={(e) => receiveForm.setData("date_of_receive", e.target.value)}
                                />
                                {receiveForm.errors.date_of_receive && (
                                    <p className="text-red-500 text-sm">{receiveForm.errors.date_of_receive}</p>
                                )}
                            </div>

                            {/* From Whom */}
                            <div>
                                <label className="block font-medium">From Whom</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={receiveForm.data.from_whom}
                                    onChange={(e) => receiveForm.setData("from_whom", e.target.value)}
                                />
                                {receiveForm.errors.from_whom && (
                                    <p className="text-red-500 text-sm">{receiveForm.errors.from_whom}</p>
                                )}
                            </div>

                            {/* Memo No */}
                            <div>
                                <label className="block font-medium">Memo No</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={receiveForm.data.memo_no}
                                    onChange={(e) => receiveForm.setData("memo_no", e.target.value)}
                                />
                                {receiveForm.errors.memo_no && (
                                    <p className="text-red-500 text-sm">{receiveForm.errors.memo_no}</p>
                                )}
                            </div>

                            {/* Memo Date */}
                            <div>
                                <label className="block font-medium">Memo Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg p-2"
                                    value={receiveForm.data.memo_date}
                                    onChange={(e) => receiveForm.setData("memo_date", e.target.value)}
                                />
                                {receiveForm.errors.memo_date && (
                                    <p className="text-red-500 text-sm">{receiveForm.errors.memo_date}</p>
                                )}
                            </div>

                            {/* Office Order No */}
                            <div>
                                <label className="block font-medium">Office Order No</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={receiveForm.data.office_order_no}
                                    onChange={(e) => receiveForm.setData("office_order_no", e.target.value)}
                                />
                                {receiveForm.errors.office_order_no && (
                                    <p className="text-red-500 text-sm">{receiveForm.errors.office_order_no}</p>
                                )}
                            </div>

                            {/* Rate */}
                            <div>
                                <label className="block font-medium">Rate</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    value={receiveForm.data.rate}
                                    onChange={(e) => receiveForm.setData("rate", e.target.value)}
                                />
                                {receiveForm.errors.rate && (
                                    <p className="text-red-500 text-sm">{receiveForm.errors.rate}</p>
                                )}
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block font-medium">Quantity</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    value={receiveForm.data.quantity}
                                    onChange={(e) => receiveForm.setData("quantity", e.target.value)}
                                />
                                {receiveForm.errors.quantity && (
                                    <p className="text-red-500 text-sm">{receiveForm.errors.quantity}</p>
                                )}
                            </div>

                            {/* Warranty Info */}
                            <div>
                                <label className="block font-medium">Warranty Information (optional)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={receiveForm.data.warranty_information}
                                    onChange={(e) => receiveForm.setData("warranty_information", e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={receiveForm.processing}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
                            >
                                {receiveForm.processing ? "Saving..." : "Add Receive Entry"}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showIssueModal && (
                <div className="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold">Issue Product</h2>
                            <button onClick={() => setShowIssueModal(false)}>✖</button>
                        </div>

                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                issueForm.post(route("store.issue.store"), {
                                    onSuccess: () => {
                                        toast.success("Product Issued Successfully!");
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
                                    className="w-full border rounded-lg p-2"
                                    value={issueForm.data.date_of_issue}
                                    onChange={(e) => issueForm.setData("date_of_issue", e.target.value)}
                                />
                            </div>

                            {/* Quantity */}
                            <div>
                                <label className="block font-medium">Quantity</label>
                                <input
                                    type="number"
                                    className="w-full border rounded-lg p-2"
                                    value={issueForm.data.quantity}
                                    onChange={(e) => issueForm.setData("quantity", e.target.value)}
                                />
                            </div>

                            {/* Issued To */}
                            <div>
                                <label className="block font-medium">Issued To (Name/Dept)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={issueForm.data.issued_to}
                                    onChange={(e) => issueForm.setData("issued_to", e.target.value)}
                                />
                            </div>

                            {/* Office Order No */}
                            <div>
                                <label className="block font-medium">Office Order No</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    value={issueForm.data.office_order_no}
                                    onChange={(e) => issueForm.setData("office_order_no", e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={issueForm.processing}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-60"
                            >
                                {issueForm.processing ? "Saving..." : "Submit Issue"}
                            </button>
                        </form>
                    </div>
                </div>
            )}



            {/* ----------------------------- SUCCESS MODAL ----------------------------- */}
            {showSuccessModal && (
                <div className="fixed inset-0 bg-black/20 bg-opacity-40 flex justify-center items-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md text-center">
                        <h2 className="text-lg font-bold mb-4">Product Added Successfully!</h2>

                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 mt-4"
                        >
                            OK
                        </button>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
