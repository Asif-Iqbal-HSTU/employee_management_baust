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
    const usersForm = useForm();      // for syncing users
    const dailyForm = useForm();   // for generating daily attendance


    const [showOfficeModal, setShowOfficeModal] = useState(false);

    const [officeStartDate, setOfficeStartDate] = useState('');
    const [officeEndDate, setOfficeEndDate] = useState('');
    const [officeIn, setOfficeIn] = useState('08:00');
    const [officeOut, setOfficeOut] = useState('14:30');


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

    const handleGenerateDailyAttendance = () => {
        dailyForm.post(route('daily.generate'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Daily attendance generated');
            },
            onError: () => {
                toast.error('Failed to generate daily attendance');
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

    const handleSyncUsers = () => {
        usersForm.post(route('users.sync'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Users synced successfully from devices');
            },
            onError: () => {
                toast.error('User sync failed');
            }
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">

                    {/* Sync Logs from Device */}
                    <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Sync Logs from Device
                        </h5>
                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                            Pull raw logs from ZKTeco devices and store into the database.
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

                    {/* Generate Daily Attendance Table */}
                    <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Generate Daily Attendance
                        </h5>
                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                            Process device logs and update daily attendance summary table.
                        </p>

                        <button
                            onClick={handleGenerateDailyAttendance}
                            disabled={dailyForm.processing}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 rounded-md focus:outline-none disabled:bg-gray-400"
                        >
                            {dailyForm.processing ? 'Generating...' : 'Generate Attendance'}
                        </button>
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

                    {/* 🔹 Sync Users from Devices */}
                    <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Sync Users from Devices
                        </h5>
                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                            Fetch user information (ID and name) from all connected devices.
                        </p>
                        <button
                            onClick={handleSyncUsers}
                            disabled={usersForm.processing}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md focus:outline-none disabled:bg-gray-400"
                        >
                            {usersForm.processing ? 'Syncing...' : 'Sync Users'}
                        </button>
                        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                            Pulls user list from all ZKTeco devices.
                        </p>
                    </div>

                    {/* Attendance Matrix Report */}
                    <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Officer/Faculty Attendance Matrix
                        </h5>
                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                            Generate monthly or range-wise attendance matrix for faculty & officers.
                        </p>

                        <Link
                            href={route('attendance.matrix.form')}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                        >
                            Open Report
                        </Link>
                    </div>

                    {/* Office Time Settings */}
                    <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                        <h5 className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                            Office Time Settings
                        </h5>

                        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
                            Set office start & end time for a date range.
                        </p>

                        <button
                            onClick={() => setShowOfficeModal(true)}
                            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md"
                        >
                            Update Office Time
                        </button>
                    </div>

                    {showOfficeModal && (
                        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg w-full max-w-md">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Update Office Time
                                </h3>

                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        axios
                                            .post(route("office_time.store"), {
                                                start_date: officeStartDate,
                                                end_date: officeEndDate,
                                                in_time: officeIn,
                                                out_time: officeOut,
                                            })
                                            .then(() => {
                                                toast.success("Office time updated");
                                                setShowOfficeModal(false);
                                            })
                                            .catch(() => toast.error("Failed to update"));
                                    }}
                                >
                                    <div className="space-y-4">

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</label>
                                            <input
                                                type="date"
                                                className="mt-1 w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
                                                value={officeStartDate}
                                                onChange={(e) => setOfficeStartDate(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">End Date</label>
                                            <input
                                                type="date"
                                                className="mt-1 w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
                                                value={officeEndDate}
                                                onChange={(e) => setOfficeEndDate(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Office Start Time</label>
                                            <input
                                                type="time"
                                                className="mt-1 w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
                                                value={officeIn}
                                                onChange={(e) => setOfficeIn(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Office End Time</label>
                                            <input
                                                type="time"
                                                className="mt-1 w-full rounded border p-2 dark:bg-gray-700 dark:text-white"
                                                value={officeOut}
                                                onChange={(e) => setOfficeOut(e.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="flex justify-end gap-2 pt-3">
                                            <button
                                                type="button"
                                                onClick={() => setShowOfficeModal(false)}
                                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-sm rounded-md dark:bg-gray-700 dark:text-white"
                                            >
                                                Cancel
                                            </button>

                                            <button
                                                type="submit"
                                                className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-md"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </AppLayout>
    );
}
