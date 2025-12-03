import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";
import { Head, Link, useForm } from "@inertiajs/react";
import React, { useState } from "react";
import { toast } from "sonner";

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

                    <button
                        onClick={() => setShowAddModal(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
                    >
                        + Add Product
                    </button>
                </div>

                {/* Product List */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {products.map((product: any) => (
                        <Link
                            key={product.id}
                            href={route("store.products", product.id)}
                            className="block rounded-xl border bg-card p-6 shadow-sm hover:shadow-md transition"
                        >
                            <h2 className="text-lg font-semibold">{product.product_name}</h2>
                            <p className="text-sm text-gray-600">
                                Stock: {product.stock_unit_number} {product.stock_unit_name}
                            </p>
                        </Link>
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
