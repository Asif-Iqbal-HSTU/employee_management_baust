import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div
                        className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <Link href={route('employeeList')}>
                            <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">View Employee Attendance</h5>

                            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">You can access All employees attendance data easily from here</p>

                        </Link>
                    </div>
                    <div
                        className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <Link href={route('attendance.today')}>
                            <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">Today's Attendance</h5>

                            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">You can access today's attendance from here</p>

                        </Link>
                    </div>
                </div>
                <div
                    className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <PlaceholderPattern
                        className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
