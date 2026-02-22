import SearchableSelect from '@/components/SearchableSelect';
import AppLayout from '@/layouts/app-layout';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import { Plus, Trash2, ShoppingCart, Calendar, Building, ListChecks, ArrowBigRight } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function VoucherPage({ products, vouchers, departments }: any) {
    const { auth }: any = usePage().props;
    const userDeptId = auth?.user?.assignment?.department_id || '';

    // Local state for the batch list
    const [itemList, setItemList] = useState<any[]>([]);
    const [currentProduct, setCurrentProduct] = useState<string>('');
    const [currentQuantity, setCurrentQuantity] = useState<string>('');

    const { data, setData, post, processing, reset, errors } = useForm({
        requisition_employee_id: auth?.user?.employee_id,
        department_id: userDeptId,
        to_be_used_in: userDeptId,
        to_be_used_in_category: 'Office',
        date: new Date().toISOString().split('T')[0],
        items: [] as any[],
    });

    const selectedProduct = products.find((p: any) => p.id == currentProduct);

    const addItem = () => {
        if (!currentProduct || !currentQuantity || Number(currentQuantity) <= 0) return;

        const product = products.find((p: any) => p.id == currentProduct);
        if (!product) return;

        // Check if product already in list
        const existing = itemList.find(item => item.store_product_id === currentProduct);
        if (existing) {
            alert('This product is already in your list.');
            return;
        }

        setItemList([...itemList, {
            store_product_id: currentProduct,
            product_name: product.product_name,
            requisitioned_quantity: currentQuantity,
            unit: product.stock_unit_name
        }]);

        setCurrentProduct('');
        setCurrentQuantity('');
    };

    const removeItem = (index: number) => {
        setItemList(itemList.filter((_, i) => i !== index));
    };

    // Keep data.items in sync with itemList
    useEffect(() => {
        setData('items', itemList.map(item => ({
            store_product_id: item.store_product_id,
            requisitioned_quantity: parseInt(item.requisitioned_quantity)
        })));
    }, [itemList]);

    const submit = (e: any) => {
        e.preventDefault();

        if (itemList.length === 0) {
            alert('Please add at least one item to the list.');
            return;
        }

        post(route('voucher.create'), {
            onSuccess: () => {
                reset('items');
                setItemList([]);
                alert('Voucher submitted successfully!');
            },
            onError: (err) => {
                console.error('Submission errors:', err);
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Store Requisition" />

            <div className="p-6 bg-gray-50 min-h-screen dark:bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    {/* Progress/Error Bar */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-bold">
                            <p className="mb-2">There were some errors with your submission:</p>
                            <ul className="list-disc list-inside">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-indigo-600 p-2 rounded-lg text-white">
                            <ShoppingCart size={24} />
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">Requisition from Store</h1>
                    </div>

                    <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                        {/* LEFT — BATCH FORM */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                                    <ListChecks size={20} />
                                    1. REQUISITION DETAILS
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Your Department</label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <select
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                value={data.department_id}
                                                onChange={(e) => setData('department_id', e.target.value)}
                                            >
                                                {departments.map((d: any) => (
                                                    <option key={d.id} value={d.id}>{d.dept_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">To Be Used In</label>
                                        <select
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                            value={data.to_be_used_in}
                                            onChange={(e) => setData('to_be_used_in', e.target.value)}
                                        >
                                            {departments.map((d: any) => (
                                                <option key={d.id} value={d.id}>{d.dept_name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Usage Category</label>
                                        <select
                                            className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                            value={data.to_be_used_in_category}
                                            onChange={(e) => setData('to_be_used_in_category', e.target.value)}
                                        >
                                            <option value="Office">Office</option>
                                            <option value="Lab">Lab</option>
                                            <option value="Shop">Shop</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                            <input
                                                type="date"
                                                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500 outline-none transition-all dark:text-white"
                                                value={data.date}
                                                onChange={(e) => setData('date', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                                <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-amber-600 dark:text-amber-400">
                                    <Plus size={20} />
                                    2. ADD PRODUCTS
                                </h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Select Product</label>
                                        <SearchableSelect
                                            items={products}
                                            value={currentProduct}
                                            onChange={(val: any) => setCurrentProduct(val)}
                                            placeholder="Choose an item..."
                                            labelKey="product_name"
                                            valueKey="id"
                                        />
                                    </div>

                                    <div className="flex gap-4 items-end">
                                        <div className="flex-1">
                                            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Quantity</label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    className={`w-full pl-4 ${selectedProduct?.stock_unit_name ? 'pr-20' : 'pr-4'} py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-amber-500 outline-none transition-all dark:text-white`}
                                                    min={1}
                                                    max={selectedProduct?.stock_unit_number}
                                                    placeholder={selectedProduct ? `Available: ${selectedProduct.stock_unit_number} ${selectedProduct.stock_unit_name}` : 'Select product'}
                                                    value={currentQuantity}
                                                    onChange={(e) => setCurrentQuantity(e.target.value)}
                                                    disabled={!selectedProduct}
                                                />
                                                {selectedProduct?.stock_unit_name && (
                                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-bold text-amber-600 uppercase bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded-lg border border-amber-100 dark:border-amber-800">
                                                        {selectedProduct.stock_unit_name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addItem}
                                            disabled={!currentProduct || !currentQuantity}
                                            className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                        >
                                            <Plus size={18} />
                                            ADD TO LIST
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — BATCH LIST & PREVIOUS */}
                        <div className="space-y-8">
                            {/* Current Batch List */}
                            <div className="bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border-2 border-dashed border-indigo-200 dark:border-indigo-800 p-6">
                                <h2 className="text-lg font-bold mb-6 flex items-center justify-between text-indigo-700 dark:text-indigo-300">
                                    <div className="flex items-center gap-2">
                                        <ShoppingCart size={20} />
                                        YOUR REQUISITION LIST
                                    </div>
                                    <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-extrabold">
                                        {itemList.length} ITEMS
                                    </span>
                                </h2>

                                {itemList.length === 0 ? (
                                    <div className="py-12 flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                                        <ShoppingCart size={48} className="mb-4 opacity-20" />
                                        <p className="font-semibold italic">Your list is currently empty.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2">
                                            {itemList.map((item, index) => (
                                                <div key={index} className="flex items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 group">
                                                    <div>
                                                        <p className="text-sm font-extrabold text-gray-900 dark:text-white uppercase">{item.product_name}</p>
                                                        <p className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">{item.requisitioned_quantity} {item.unit}</p>
                                                    </div>
                                                    <button
                                                        onClick={() => removeItem(index)}
                                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={submit}
                                            disabled={processing}
                                            className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all flex items-center justify-center gap-3 uppercase tracking-widest disabled:opacity-50"
                                        >
                                            {processing ? 'Processing...' : (
                                                <>
                                                    SUBMIT ALL VOUCHERS
                                                    <ArrowBigRight size={24} />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Previous Vouchers (Simplified for history) */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
                                <h2 className="text-sm font-bold mb-4 text-gray-500 uppercase tracking-widest">Recent Requisitions</h2>
                                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                    {vouchers.map((v: any) => (
                                        <div key={v.id} className="p-3 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                            <div className="flex items-center justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-gray-900 dark:text-white uppercase truncate">{v.product?.product_name}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-bold text-gray-500">{v.date}</span>
                                                        <span className="text-[10px] font-bold text-indigo-600 uppercase">{v.requisitioned_quantity} {v.product?.stock_unit_name}</span>
                                                    </div>
                                                </div>
                                                <div className={`text-[10px] font-extrabold px-2 py-1 rounded ml-2 ${v.issued_by_storeman === 'Yes' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                                                    v.issued_by_storeman === 'Cancelled' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' :
                                                        'bg-gray-50 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}>
                                                    ST: {v.issued_by_storeman === 'Yes' ? 'ISSUED' : v.issued_by_storeman === 'Cancelled' ? 'REJECTED' : v.issued_by_storeman}
                                                </div>
                                            </div>

                                            {/* Storeman Comment */}
                                            {v.storeman_comment && (
                                                <div className="mt-2 text-[10px] bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded border border-yellow-100 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200">
                                                    <span className="font-bold">Note:</span> {v.storeman_comment}
                                                    {v.issued_by_storeman === 'Yes' && v.issued_quantity && (
                                                        <div className="mt-1 font-bold text-green-700 dark:text-green-400">
                                                            Issued: {v.issued_quantity}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
