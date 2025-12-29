import SearchableSelect from '@/components/SearchableSelect';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage } from '@inertiajs/react';

export default function VoucherPage({ products, vouchers, departments }: any) {
    const auth = usePage().props.auth.user;
    console.log(auth.employee_id);
    const { data, setData, post, processing, reset, errors } = useForm({
        store_product_id: '',
        requisition_employee_id: auth.employee_id,
        department_id: '',
        to_be_used_in: '',
        to_be_used_in_category: '',
        date: '',
        requisitioned_quantity: '',
    });

    const selectedProduct = products.find((p: any) => p.id == data.store_product_id);

    const submit = (e: any) => {
        e.preventDefault();
        post(route('voucher.create'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AppLayout>
            <Head title="Issue Voucher" />

            <div className="p-6">
                <h1 className="mb-4 text-xl font-semibold">Issue Voucher</h1>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {/* LEFT — FORM */}
                    <div className="rounded bg-white p-5 shadow">
                        <h2 className="mb-3 text-lg font-semibold">New Requisition</h2>

                        <form onSubmit={submit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium">Product</label>

                                <SearchableSelect
                                    items={products}
                                    value={data.store_product_id}
                                    onChange={(val: any) => setData('store_product_id', val)}
                                    placeholder="Select Product"
                                    labelKey="product_name"
                                    valueKey="id"
                                />
                                {errors.store_product_id && <div className="text-xs text-red-600">{errors.store_product_id}</div>}
                            </div>

                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium">Department</label>
                                <select className="input" value={data.department_id} onChange={(e) => setData('department_id', e.target.value)}>
                                    <option value="">Select Department</option>
                                    {departments.map((d: any) => (
                                        <option key={d.id} value={d.id}>
                                            {d.dept_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* To Be Used In */}
                            <div>
                                <label className="block text-sm font-medium">To Be Used In</label>
                                <select className="input" value={data.to_be_used_in} onChange={(e) => setData('to_be_used_in', e.target.value)}>
                                    <option value="">Select Department</option>
                                    {departments.map((d: any) => (
                                        <option key={d.id} value={d.id}>
                                            {d.dept_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium">Usage Category</label>
                                <select
                                    className="input"
                                    value={data.to_be_used_in_category}
                                    onChange={(e) => setData('to_be_used_in_category', e.target.value)}
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
                                <input type="date" className="input" value={data.date} onChange={(e) => setData('date', e.target.value)} />
                            </div>

                            {/* requisitioned_quantity */}
                            {/*<div>
                                <label className="block text-sm font-medium">requisitioned_quantity</label>
                                <input
                                    type="number"
                                    className="input"
                                    value={data.requisitioned_quantity}
                                    onChange={(e) => setData("requisitioned_quantity", e.target.value)}
                                />
                            </div>*/}
                            <div>
                                <label className="block text-sm font-medium">
                                    Requisitioned Quantity
                                    {selectedProduct && (
                                        <span className="ml-1 text-xs text-gray-500">
                                            (Available: {selectedProduct.stock_unit_number} {selectedProduct.stock_unit_name})
                                        </span>
                                    )}
                                </label>

                                <input
                                    type="number"
                                    className="input"
                                    min={1}
                                    max={selectedProduct?.stock_unit_number || undefined}
                                    placeholder={selectedProduct ? `Max ${selectedProduct.stock_unit_number}` : 'Select product first'}
                                    value={data.requisitioned_quantity}
                                    onChange={(e) => {
                                        const value = Number(e.target.value);

                                        if (selectedProduct && value > selectedProduct.stock_unit_number) {
                                            setData('requisitioned_quantity', selectedProduct.stock_unit_number.toString());
                                        } else {
                                            setData('requisitioned_quantity', e.target.value);
                                        }
                                    }}
                                    disabled={!selectedProduct}
                                />

                                {selectedProduct && Number(data.requisitioned_quantity) > selectedProduct.stock_unit_number && (
                                    <div className="text-xs text-red-600">Quantity cannot exceed available stock</div>
                                )}
                            </div>

                            <button type="submit" disabled={processing} className="rounded bg-blue-600 px-4 py-2 text-white shadow hover:bg-blue-700">
                                Save Voucher
                            </button>
                        </form>
                    </div>

                    {/* RIGHT — PREVIOUS VOUCHERS */}
                    <div className="rounded bg-white p-5 shadow">
                        <h2 className="mb-3 text-lg font-semibold">Previous Vouchers</h2>

                        <div className="max-h-[600px] overflow-y-auto">
                            <table className="w-full border">
                                <thead>
                                    <tr className="bg-gray-100 text-left">
                                        <th className="border p-2">Date</th>
                                        <th className="border p-2">Product</th>
                                        <th className="border p-2">Quantity</th>
                                        <th className="border p-2">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vouchers.map((v: any) => (
                                        <tr key={v.id} className="border">
                                            <td className="border p-2">{v.date}</td>
                                            <td className="border p-2">{v.product?.product_name}</td>
                                            <td className="border p-2">{v.requisitioned_quantity}</td>
                                            <td className="border p-2">
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
