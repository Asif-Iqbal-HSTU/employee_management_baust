import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function Categoryandproduct({ categories, products, filters }: any) {
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
                }
            );
        }, 400);

        return () => clearTimeout(delay);
    }, [search]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Store Categories & Products" />

            <div className="p-6">
                <h1 className="mb-4 text-xl font-bold">Store Products</h1>

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
                                    href={route('store.products', product.store_category_id)}
                                    className="flex justify-between border-b px-4 py-3 hover:bg-gray-50"
                                >
                                    <div>
                                        <p className="font-medium">{product.product_name}</p>
                                        <p className="text-xs text-gray-500">
                                            Category: {product.store_category.category_name}
                                        </p>
                                    </div>

                                    <div className="text-right text-sm">
                                        <p className="font-semibold">
                                            Stock: {product.stock_unit_number}
                                        </p>
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
                            <h2 className="text-lg font-semibold">
                                {category.category_name}
                            </h2>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

