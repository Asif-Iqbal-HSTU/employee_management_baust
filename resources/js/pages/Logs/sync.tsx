import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner'; // optional if using toast

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Sync Logs', href: '/sync-logs' },
];

export default function SyncLogs() {
    const syncForm = useForm();       // for syncing logs
    const reportForm = useForm();     // for sending reports

    const [lastSynced, setLastSynced] = useState<string | null>(null);
    const [lastSent, setLastSent] = useState<string | null>(null);

    useEffect(() => {
        fetchLastSyncedTime();
        fetchLastSentTime();
    }, []);

    const fetchLastSyncedTime = async () => {
        try {
            const response = await axios.get(route('logs.last_sync_time'));
            setLastSynced(response.data.last_synced);
        } catch (error) {
            console.error("Failed to fetch last synced time", error);
        }
    };

    const fetchLastSentTime = async () => {
        try {
            const response = await axios.get(route('report.last_sent'));
            setLastSent(response.data.last_sent);
        } catch (error) {
            console.error("Failed to fetch last sent time", error);
        }
    };

    const handleSync = () => {
        syncForm.post(route('logs.sync'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Logs synced successfully');
                fetchLastSyncedTime();
            },
            onError: () => {
                toast.error('Sync failed');
            }
        });
    };

    const handleSendReport = () => {
        reportForm.post(route('report.send_department'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Report sent successfully');
                fetchLastSentTime();
            },
            onError: () => {
                toast.error('Sending report failed or too soon');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">

                    {/* View Attendance Card */}
                    {/*<div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <Link href={route('employeeList')}>
                            <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                View Employee Attendance
                            </h5>
                            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                                You can access all employees’ attendance data from here.
                            </p>
                        </Link>
                    </div>*/}

                    {/* Today's Attendance Card */}
                    {/*<div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <Link href={route('attendance.today')}>
                            <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                Today's Attendance
                            </h5>
                            <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                                View today's attendance records.
                            </p>
                        </Link>
                    </div>*/}

                    {/* Sync Logs from Device */}
                    <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Sync Logs from Device
                        </h5>
                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                            Pull raw logs from ZKTeco devices and store into database.
                        </p>
                        <button
                            onClick={handleSync}
                            disabled={syncForm.processing}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none disabled:bg-gray-400"
                        >
                            {syncForm.processing ? 'Syncing...' : 'Sync Logs'}
                        </button>
                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            Last synced: {lastSynced ? lastSynced : 'Never'}
                        </p>
                    </div>

                    {/* Send Attendance Report */}
                    <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Send Attendance Report
                        </h5>
                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                            Generate and email attendance reports to department heads manually.
                        </p>
                        <button
                            onClick={handleSendReport}
                            disabled={reportForm.processing}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md focus:outline-none disabled:bg-gray-400"
                        >
                            {reportForm.processing ? 'Sending...' : 'Send Report'}
                        </button>
                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            Last sent: {lastSent ? lastSent : 'Never'}
                        </p>
                    </div>
                </div>

                {/*<div className="border-sidebar-border/70 dark:border-sidebar-border relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border md:min-h-min">
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>*/}
            </div>
        </AppLayout>
    );
}
