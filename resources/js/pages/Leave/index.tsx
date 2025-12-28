import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { CalendarCheck, HeartPulse, PlusCircle, Blocks } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';
import { useForm } from '@inertiajs/react';
import SearchableSelect from '@/components/SearchableSelect';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Leave Management', href: '/leave-management' }];

export default function Leave({ leaves, remainingCasual, remainingMedical, remainingEarned, employees }: any) {

    console.log(remainingCasual);
    console.log(remainingMedical);

    const [showModal, setShowModal] = useState(false);
    const [balanceError, setBalanceError] = useState<string | null>(null);
    const [dateConflictError, setDateConflictError] = useState<string | null>(null);


    const calculateDays = () => {
        if (!data.startdate || !data.enddate) return 0;

        const start = new Date(data.startdate);
        const end = new Date(data.enddate);

        const diff =
            Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

        return diff > 0 ? diff : 0;
    };



    const { data, setData, post, processing, errors, reset } = useForm({
        leave_type: 'Casual Leave',
        startdate: '',
        enddate: '',
        reason: '',
        replace: '',
        medical_file: null as File | null,
    });

    const submitLeave = () => {
        const requestedDays = calculateDays();

        let remaining = 0;

        if (data.leave_type === 'Casual Leave') {
            remaining = remainingCasual;
        } else if (data.leave_type === 'Medical Leave') {
            remaining = remainingMedical;
        }

        // 🔥 Balance check
        if (requestedDays > remaining) {
            setBalanceError(
                `Requested ${requestedDays} day(s), but only ${remaining} ${data.leave_type} remaining.`
            );
            return;
        }

        post(route('leave.request'), {
            forceFormData: true,
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    };

    useEffect(() => {
        const conflict = (errors as any).date_conflict;
        if (conflict) {
            setDateConflictError(conflict);
        }
    }, [errors]);



    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Leave Management" />

            {/* Main Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">

                {/* LEFT COLUMN */}
                <div className="space-y-6">

                    {/* Casual Leave Card */}
                    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                        <CalendarCheck className="h-10 w-10 text-blue-600" />
                        <div>
                            <p className="text-sm text-gray-500">Casual Leave Remaining</p>
                            <p className="text-2xl font-bold text-blue-600">{remainingCasual}</p>
                        </div>
                    </div>

                    {/* Medical Leave Card */}
                    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                        <HeartPulse className="h-10 w-10 text-green-600" />
                        <div>
                            <p className="text-sm text-gray-500">Medical Leave Remaining</p>
                            <p className="text-2xl font-bold text-green-600">{remainingMedical}</p>
                        </div>
                    </div>

                    {/* Earned Leave Card */}
                    <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
                        <Blocks className="h-10 w-10 text-purple-600" />
                        <div>
                            <p className="text-sm text-gray-500">Earned Leave Remaining</p>
                            <p className="text-2xl font-bold text-purple-600">{remainingEarned}</p>
                        </div>
                    </div>

                    {/* Apply Leave Card */}
                    <div
                        onClick={() => setShowModal(true)}
                        className="cursor-pointer bg-indigo-600 text-white rounded-xl shadow p-5 flex items-center gap-4 hover:bg-indigo-700 transition"
                    >
                        <PlusCircle className="h-10 w-10" />
                        <div>
                            <p className="text-lg font-semibold">Apply for Leave</p>
                            <p className="text-sm opacity-90">Submit a new leave request</p>
                        </div>
                    </div>
                    {/* Leave Balance Note */}
                    <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-700">
                        <p className="font-medium">ℹ️ Note</p>
                        <p className="mt-1">
                            Leave balances will be adjusted starting from
                            <span className="font-semibold"> January 01, 2026</span>.
                        </p>
                    </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Leave History</h2>

                    <div className="overflow-x-auto">
                        <table className="w-full border border-gray-200 rounded text-sm">
                            <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="border px-4 py-2">Type</th>
                                <th className="border px-4 py-2">Dates</th>
                                <th className="border px-4 py-2">Reason</th>
                                <th className="border px-4 py-2">Replacement</th>
                                <th className="border px-4 py-2">Status</th>
                            </tr>
                            </thead>
                            <tbody>
                            {leaves.length > 0 ? (
                                leaves.map((l: any) => (
                                    <tr key={l.id} className="hover:bg-gray-50">
                                        <td className="border px-4 py-2">{l.type}</td>
                                        <td className="border px-4 py-2">{l.start_date} → {l.end_date}</td>
                                        <td className="border px-4 py-2">{l.reason ?? '—'}</td>
                                        <td className="border px-4 py-2">{l.replacement_name ?? '—'}</td>
                                        <td className="border px-4 py-2">
                                                <span className={`px-2 py-1 rounded text-xs font-medium
                                                    ${l.status === 'Approved by Registrar' ? 'bg-green-100 text-green-700' :
                                                    l.status === 'Denied by Head' ? 'bg-red-100 text-red-700' :
                                                        'bg-yellow-100 text-yellow-700'}`}>
                                                    {l.status}
                                                </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center py-4 text-gray-500">
                                        No leave history found
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* MODAL (unchanged logic) */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl shadow-lg w-96">

                        <h2 className="text-lg font-bold mb-4">Request Leave</h2>

                        <label className="block mb-1 text-sm font-medium">Leave Type</label>
                        <select
                            value={data.leave_type}
                            onChange={(e) => {
                                setData('leave_type', e.target.value);

                                // 🔥 IMPORTANT: clear file when not medical leave
                                if (e.target.value !== 'Medical Leave') {
                                    setData('medical_file', null);
                                }
                            }}
                            className="w-full border rounded p-2 mb-1"
                        >
                        <option value="Casual Leave">Casual Leave</option>
                            <option value="Medical Leave">Medical Leave</option>
                            <option value="Earned Leave">Earned Leave</option>
                            {/*<option value="Duty Leave">Duty Leave</option>*/}
                        </select>
                        {errors.leave_type && (
                            <p className="text-red-600 text-sm mb-2">{errors.leave_type}</p>
                        )}


                        <label className="block mb-1 text-sm font-medium">Start Date</label>
                        <input
                            type="date"
                            value={data.startdate}
                            onChange={(e) => setData('startdate', e.target.value)}
                            className="w-full border rounded p-2 mb-1"
                        />
                        {errors.startdate && (
                            <p className="text-red-600 text-sm mb-2">{errors.startdate}</p>
                        )}

                        <label className="block mb-1 text-sm font-medium">End Date</label>
                        <input
                            type="date"
                            value={data.enddate}
                            onChange={(e) => setData('enddate', e.target.value)}
                            className="w-full border rounded p-2 mb-1"
                        />
                        {errors.enddate && (
                            <p className="text-red-600 text-sm mb-2">{errors.enddate}</p>
                        )}

                        {data.leave_type === 'Medical Leave' && (
                            <>
                                <label className="block mb-1 text-sm font-medium">Medical Certificate</label>
                                <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    onChange={(e) => setData('medical_file', e.target.files?.[0] || null)}
                                    className="w-full border rounded p-2 mb-1"
                                />

                                {errors.medical_file && (
                                    <p className="text-red-600 text-sm mb-2">
                                        {errors.medical_file}
                                    </p>
                                )}
                            </>
                        )}

                        <label className="block mb-1 text-sm font-medium">Reason</label>
                        <textarea
                            value={data.reason}
                            onChange={(e) => setData('reason', e.target.value)}
                            className="w-full border rounded p-2 mb-1"
                        />
                        {errors.reason && (
                            <p className="text-red-600 text-sm mb-2">{errors.reason}</p>
                        )}


                        {/*<label className="block mb-1 text-sm font-medium">Replacement</label>
                        <input
                            value={data.replace}
                            onChange={(e) => setData('replace', e.target.value)}
                            className="w-full border rounded p-2 mb-1"
                        />
                        {errors.replace && (
                            <p className="text-red-600 text-sm mb-2">{errors.replace}</p>
                        )}*/}

                        <label className="block mb-1 text-sm font-medium">
                            Replacement
                        </label>
                        <SearchableSelect
                            items={employees}
                            value={data.replace}
                            onChange={(val: any) => setData('replace', val)}
                            placeholder="Select Replacement Employee"
                            labelKey="name"
                            valueKey="employee_id"
                        />
                        {errors.replace && (
                            <p className="text-red-600 text-sm mb-2">
                                {errors.replace}
                            </p>
                        )}

                        <div
                            className="mb-2"
                        />

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowModal(false)} className="px-4 py-2 bg-gray-200 rounded">
                                Cancel
                            </button>
                            <button
                                onClick={submitLeave}
                                disabled={processing}
                                className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
                            >
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {balanceError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
                        <h2 className="text-lg font-bold text-red-600 mb-2">
                            Leave Balance Exceeded
                        </h2>

                        <p className="text-gray-700 mb-4">
                            {balanceError}
                        </p>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setBalanceError(null)}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {dateConflictError && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white rounded-xl p-6 w-96 shadow-lg">
                        <h2 className="text-lg font-bold text-red-600 mb-2">
                            Leave Date Conflict
                        </h2>

                        <p className="text-gray-700 mb-4">
                            {dateConflictError}
                        </p>

                        <div className="flex justify-end">
                            <button
                                onClick={() => setDateConflictError(null)}
                                className="px-4 py-2 bg-red-600 text-white rounded"
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </div>
            )}


        </AppLayout>
    );
}
