// Dashboard.tsx
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';
import AttendanceCalendar from '@/components/AttendanceCalendar';
import axios from 'axios'; // if you still use axios for last synced/sent

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function Dashboard() {
    const { props }: any = usePage();
    const { employeeId, todayEntry, logs, calendarLogs, holidays2025, summary, month, year } = props;

/*    const employeeId   = props.employeeId;
    const todayEntry   = props.todayEntry;
    const logs         = props.logs;           // 7-day table
    const calendarLogs = props.calendarLogs;   // month data
    const holidays2025 = props.holidays2025;*/

    const [lastSynced, setLastSynced] = useState<string | null>(null);
    const [lastSent, setLastSent]     = useState<string | null>(null);

    useEffect(() => {
        fetchLastSyncedTime();
        fetchLastSentTime();
    }, []);

    const fetchLastSyncedTime = async () => {
        try {
            const response = await axios.get(route('logs.last_sync_time'));
            setLastSynced(response.data.last_synced);
        } catch {}
    };
    const fetchLastSentTime = async () => {
        try {
            const response = await axios.get(route('report.last_sent'));
            setLastSent(response.data.last_sent);
        } catch {}
    };

    const syncForm = useForm();
    const reportForm = useForm();

    const handleSync = () => {
        syncForm.post(route('logs.sync'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Logs synced successfully'),
            onError: () => toast.error('Sync failed'),
        });
    };

    const handleSendReport = () => {
        reportForm.post(route('report.send_department'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Report sent successfully'),
            onError: () => toast.error('Sending report failed or too soon'),
        });
    };

    /*return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    {employeeId == 25052 && (
                        <>
                            <div className="max-w-sm p-6 bg-white border rounded-lg shadow-sm">
                                <h5 className="mb-2 text-xl font-bold">Sync Logs from Device</h5>
                                <button
                                    onClick={handleSync}
                                    disabled={syncForm.processing}
                                    className="px-4 py-2 mt-2 text-sm font-medium text-white bg-blue-600 rounded-md"
                                >
                                    {syncForm.processing ? 'Syncing...' : 'Sync Logs'}
                                </button>
                            </div>
                            <div className="max-w-sm p-6 bg-white border rounded-lg shadow-sm">
                                <h5 className="mb-2 text-xl font-bold">Send Attendance Report</h5>
                                <button
                                    onClick={handleSendReport}
                                    disabled={reportForm.processing}
                                    className="px-4 py-2 mt-2 text-sm font-medium text-white bg-green-600 rounded-md"
                                >
                                    {reportForm.processing ? 'Sending...' : 'Send Report'}
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/!* Personal summary *!/}
                <div className="mt-6 grid gap-6">
                    {/!*<div className="p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg text-center text-white">
                        <h2 className="text-2xl font-bold">Today's First Entry</h2>
                        <p className="text-5xl font-extrabold mt-4">
                            {todayEntry ?? 'No Entry'}
                        </p>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                        <h3 className="text-lg font-bold mb-4">Last 7 Days</h3>
                        <table className="w-full border-collapse">
                            <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="px-4 py-2 text-left">Date</th>
                                <th className="px-4 py-2 text-left">Entry</th>
                                <th className="px-4 py-2 text-left">Exit</th>
                            </tr>
                            </thead>
                            <tbody>
                            {logs.map((log: any, i: number) => (
                                <tr key={i} className="border-t">
                                    <td className="px-4 py-2">{log.date}</td>
                                    <td className="px-4 py-2">{log.in_time}</td>
                                    <td className="px-4 py-2">{log.out_time}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>*!/}

                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 mb-6">
                        <h3 className="text-lg font-bold mb-4">Monthly Summary</h3>
                        <table className="w-full border-collapse">
                            <thead>
                            <tr className="bg-gray-100 dark:bg-gray-700">
                                <th className="px-4 py-2">Absences</th>
                                <th className="px-4 py-2">Late Entries</th>
                                <th className="px-4 py-2">Early Leaves</th>
                            </tr>
                            </thead>
                            <tbody>
                            <tr className="border-t">
                                <td className="px-4 py-2">{props.summary.absence}</td>
                                <td className="px-4 py-2">{props.summary.late}</td>
                                <td className="px-4 py-2">{props.summary.early}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>


                    {/!* NEW: Month calendar *!/}
                    <AttendanceCalendar logs={calendarLogs} />
                </div>
            </div>
        </AppLayout>
    );*/

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {/* Admin cards remain... */}

                {/* Monthly Summary */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
                    <h3 className="text-lg font-bold mb-4">Monthly Summary</h3>
                    <table className="w-full border-collapse text-sm md:text-base">
                        <thead>
                        <tr className="bg-gray-100 dark:bg-gray-700">
                            <th className="px-4 py-2 text-left">Absences</th>
                            <th className="px-4 py-2 text-left">Late Entries (&gt; 08:00)</th>
                            <th className="px-4 py-2 text-left">Early Leaves (&lt; 14:30)</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="border-t">
                            <td className="px-4 py-2">{summary.absence}</td>
                            <td className="px-4 py-2">{summary.late}</td>
                            <td className="px-4 py-2">{summary.early}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>

                {/* Calendar */}
                <AttendanceCalendar logs={calendarLogs} month={month} year={year} />
            </div>
        </AppLayout>
    );
}
