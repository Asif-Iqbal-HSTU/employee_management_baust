import AppLayout from '@/layouts/app-layout';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Categoryandproduct({ categories, products, filters }: any) {
    const auth = usePage().props.auth.user;
    const breadcrumbs = [{ title: 'Categories of Store Products', href: '/categories' }];
    const [search, setSearch] = useState(filters?.search || '');

    /* ================= LIVE SEARCH ================= */
    useEffect(() => {
        const delay = setTimeout(() => {
            router.get(
                route('category.index'),
                { search },
                {
                    preserveState: true,
                    replace: true,
                },
            );
        }, 400);

        return () => clearTimeout(delay);
    }, [search]);

    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const categoryForm = useForm({
        category_name: '',
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Store Categories & Products" />

            <div className="p-6">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="mb-4 text-xl font-bold">Store Products</h1>

                    {(auth.employee_id === '15302' || auth.employee_id === '19001') && (
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCategoryModal(true)}
                                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
                            >
                                + Add Category
                            </button>
                        </div>
                    )}
                </div>

                {/* 🔍 SEARCH BAR */}
                <div className="mb-6">
                    <input
                        type="text"
                        placeholder="Search product..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-lg border p-3 focus:border-blue-500 focus:outline-none"
                    />
                </div>

                {/* 🔎 SEARCH RESULTS */}
                {search && (
                    <div className="mb-8 rounded-lg border bg-white shadow-sm">
                        {products.length ? (
                            products.map((product: any) => (
                                <Link
                                    key={product.id}
                                    href={route('store.products', product.store_category_id, {
                                        highlight: product.id,
                                    })}
                                    className="flex justify-between border-b px-4 py-3 hover:bg-gray-50"
                                >

                                <div>
                                        <p className="font-medium">{product.product_name}</p>
                                        <p className="text-xs text-gray-500">Category: {product.store_category.category_name}</p>
                                    </div>

                                    <div className="text-right text-sm">
                                        <p className="font-semibold">Stock: {product.stock_unit_number}</p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="p-4 text-sm text-gray-500">No products found</p>
                        )}
                    </div>
                )}

                {/* 📁 CATEGORIES */}
                <h2 className="mb-4 text-lg font-semibold">Categories</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    {categories.map((category: any) => (
                        <Link
                            key={category.id}
                            href={route('store.products', category.id)}
                            className="bg-card block rounded-xl border p-6 shadow-sm transition hover:shadow-md"
                        >
                            <h2 className="text-lg font-semibold">{category.category_name}</h2>
                        </Link>
                    ))}
                </div>

                {showCategoryModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                        <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg">
                            <div className="mb-4 flex justify-between">
                                <h2 className="text-lg font-bold">Add Category</h2>
                                <button onClick={() => setShowCategoryModal(false)}>✖</button>
                            </div>

                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    categoryForm.post(route('category.create'), {
                                        onSuccess: () => {
                                            categoryForm.reset();
                                            setShowCategoryModal(false);
                                        },
                                    });
                                }}
                                className="space-y-4"
                            >
                                <div>
                                    <label className="block font-medium">Category Name</label>
                                    <input
                                        type="text"
                                        className="w-full rounded-lg border p-2"
                                        value={categoryForm.data.category_name}
                                        onChange={(e) => categoryForm.setData('category_name', e.target.value)}
                                    />
                                    {categoryForm.errors.category_name && <p className="text-sm text-red-500">{categoryForm.errors.category_name}</p>}
                                </div>

                                <button type="submit" className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700">
                                    Save Category
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
