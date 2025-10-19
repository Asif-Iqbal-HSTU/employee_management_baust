import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function DeptList({ departments, attendance }: any) {
    const breadcrumbs: BreadcrumbItem[] = [{ title: 'All Department Attendance', href: '/departments' }];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Department Attendance" />
            <div className="p-6">
                <h1 className="mb-6 text-xl font-bold">All Departments</h1>

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2">
                    {departments.map((dept: any) => (
                        <Link
                            key={dept.id}
                            href={`/departments/${dept.id}/attendance`}
                            className="bg-card block rounded-2xl border p-6 shadow-sm transition hover:shadow-md"
                        >
                            <div className="mt-4">
                                <h2 className="text-lg font-semibold">{dept.short_name}</h2>
                                {attendance[dept.id]?.today && (
                                    <p className="mb-2 text-sm text-gray-600">
                                        (Today: Total: {attendance[dept.id].today.total} | Late:{' '}
                                        <span className="font-medium text-orange-500">{attendance[dept.id].today.late}</span> | Not Present:{' '}
                                        <span className="font-medium text-red-500">{attendance[dept.id].today.absent}</span>)
                                    </p>
                                )}

                                <div className="h-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={attendance[dept.id]?.graph}>
                                            <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="absent" fill="#ef4444" name="Absent" />
                                            <Bar dataKey="late" fill="#f97316" name="Late" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
