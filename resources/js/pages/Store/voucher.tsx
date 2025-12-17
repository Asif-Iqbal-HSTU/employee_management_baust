import AppLayout from "@/layouts/app-layout";
import { Head, useForm, Link, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import SearchableSelect from "@/components/SearchableSelect";


export default function VoucherPage({ products, vouchers, departments }: any) {
    const auth = usePage().props.auth.user;
    console.log(auth.employee_id);
    const { data, setData, post, processing, reset, errors } = useForm({
        store_product_id: "",
        requisition_employee_id: auth.employee_id,
        department_id: "",
        to_be_used_in: "",
        to_be_used_in_category: "",
        date: "",
        requisitioned_quantity: "",
    });

    const submit = (e: any) => {
        e.preventDefault();
        post(route("voucher.create"), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Issue Voucher" />

            <div className="p-6">
                <h1 className="text-xl font-semibold mb-4">Issue Voucher</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT — FORM */}
                    <div className="bg-white p-5 rounded shadow">
                        <h2 className="text-lg font-semibold mb-3">New Requisition</h2>

                        <form onSubmit={submit} className="space-y-4">
                            {/* Product */}
                            {/*<div>
                                <label className="block text-sm font-medium">Product</label>
                                <select
                                    className="input"
                                    value={data.store_product_id}
                                    onChange={(e) => setData("store_product_id", e.target.value)}
                                >
                                    <option value="">Select Product</option>
                                    {products.map((p: any) => (
                                        <option key={p.id} value={p.id}>{p.product_name}</option>
                                    ))}
                                </select>
                                {errors.store_product_id && (
                                    <div className="text-red-600 text-xs">{errors.store_product_id}</div>
                                )}
                            </div>*/}
                            <div>
                                <label className="block text-sm font-medium">Product</label>

                                <SearchableSelect
                                    items={products}
                                    value={data.store_product_id}
                                    onChange={(val: any) => setData("store_product_id", val)}
                                    placeholder="Select Product"
                                    labelKey="product_name"
                                    valueKey="id"
                                />

                                {errors.store_product_id && (
                                    <div className="text-red-600 text-xs">
                                        {errors.store_product_id}
                                    </div>
                                )}
                            </div>


                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium">Department</label>
                                <select
                                    className="input"
                                    value={data.department_id}
                                    onChange={(e) => setData("department_id", e.target.value)}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((d: any) => (
                                        <option key={d.id} value={d.id}>{d.dept_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* To Be Used In */}
                            <div>
                                <label className="block text-sm font-medium">To Be Used In</label>
                                <select
                                    className="input"
                                    value={data.to_be_used_in}
                                    onChange={(e) => setData("to_be_used_in", e.target.value)}
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((d: any) => (
                                        <option key={d.id} value={d.id}>{d.dept_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium">Usage Category</label>
                                <select
                                    className="input"
                                    value={data.to_be_used_in_category}
                                    onChange={(e) =>
                                        setData("to_be_used_in_category", e.target.value)
                                    }
                                >
                                    <option value="">Select Category</option>
                                    <option value="Shop">Shop</option>
                                    <option value="Lab">Lab</option>
                                    <option value="Office">Office</option>
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium">Date</label>
                                <input
                                    type="date"
                                    className="input"
                                    value={data.date}
                                    onChange={(e) => setData("date", e.target.value)}
                                />
                            </div>

                            {/* requisitioned_quantity */}
                            <div>
                                <label className="block text-sm font-medium">requisitioned_quantity</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={data.requisitioned_quantity}
                                    onChange={(e) => setData("requisitioned_quantity", e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
                            >
                                Save Voucher
                            </button>
                        </form>
                    </div>

                    {/* RIGHT — PREVIOUS VOUCHERS */}
                    <div className="bg-white p-5 rounded shadow">
                        <h2 className="text-lg font-semibold mb-3">Previous Vouchers</h2>

                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="w-full border">
                                <thead>
                                <tr className="bg-gray-100 text-left">
                                    <th className="p-2 border">Date</th>
                                    <th className="p-2 border">Product</th>
                                    <th className="p-2 border">Quantity</th>
                                    <th className="p-2 border">Status</th>
                                </tr>
                                </thead>
                                <tbody>
                                {vouchers.map((v: any) => (
                                    <tr key={v.id} className="border">
                                        <td className="p-2 border">{v.date}</td>
                                        <td className="p-2 border">{v.product?.product_name}</td>
                                        <td className="p-2 border">{v.requisitioned_quantity}</td>
                                        <td className="p-2 border">
                                            Head: {v.allowed_by_head} • Reg: {v.allowed_by_registrar} • Store: {v.issued_by_storeman}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
