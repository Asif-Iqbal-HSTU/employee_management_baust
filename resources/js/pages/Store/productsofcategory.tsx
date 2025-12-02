import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import React from 'react';
import { toast } from 'sonner';

export default function DeptList({ products, category }: any) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'Categories of Store Preducts', href: '/categories' }];

    console.log(category);

    const today = new Date().toISOString().split('T')[0];

    const { data, setData, post, processing, reset, errors } = useForm({
        date: today,
        startTime: '',
        endTime: '',
        taskDescription: '',
        status: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('worklog.store'), {
            onSuccess: () => {
                toast.success('Worklog added successfully!');
                reset('startTime', 'endTime', 'taskDescription', 'status');
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Worklog Manager" />
            <div className="p-6">
                <h1 className="mb-6 text-xl font-bold">{category.category_name}</h1>
                {/* SUMMARY BOXES */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Absent */}
                    {products.map((product: any) => (
                        <Link
                            key={product.id}
                            href={route('store.products', product.id)}
                            className="bg-card block rounded-xl border p-6 shadow-sm transition hover:shadow-md"
                        >
                            <h2 className="text-lg font-semibold">{product.product_name}</h2>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
