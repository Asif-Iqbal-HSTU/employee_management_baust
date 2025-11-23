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
