import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";

export default function DeptList({ departments }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "All Department Attendance", href: "/departments" },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Department Attendance" />
            <div className="p-6">
            <h1 className="text-xl font-bold mb-6">All Departments</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {departments.map((dept: any) => (
                    <Link
                        key={dept.id}
                        href={`/departments/${dept.id}/attendance`}
                        className="block rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition"
                    >
                        <h2 className="text-lg font-semibold">{dept.dept_name}</h2>
                        <p className="text-sm text-gray-500">{dept.short_name}</p>
                    </Link>
                ))}
            </div>
            </div>
        </AppLayout>
    );
}
