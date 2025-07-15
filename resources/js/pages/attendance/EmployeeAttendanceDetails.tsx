import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function EmployeeAttendanceDetails({ name, employee_id, days, absent, late, early_exit }: any) {
    return (
        <AppLayout breadcrumbs={[
            { title: 'All Employees', href: '/allEmployeeAttendance' },
            { title: name, href: `/employee-attendance/${employee_id}` },
        ]}>
            <Head title={`Attendance - ${name}`} />
            <div className="p-4 space-y-4">
                <h1 className="text-xl font-bold">Attendance Summary for {name} ({employee_id})</h1>

                <div className="grid grid-cols-3 gap-4 text-sm">
                    <div><strong>Absent Days:</strong> {absent}</div>
                    <div><strong>Late Entries:</strong> {late}</div>
                    <div><strong>Early Exits:</strong> {early_exit}</div>
                </div>

                <div className="overflow-auto max-h-[70vh] border rounded">
                    <table className="min-w-full text-sm divide-y divide-gray-200">
                        <thead className="bg-gray-100 sticky top-0">
                        <tr>
                            <th className="px-4 py-2 text-left">Date</th>
                            <th className="px-4 py-2 text-left">Entry</th>
                            <th className="px-4 py-2 text-left">Exit</th>
                        </tr>
                        </thead>
                        <tbody>
                        {days.map((day: any, i: number) => (
                            <tr key={i} className="hover:bg-gray-50">
                                <td className="px-4 py-2">{day.date}</td>
                                <td className="px-4 py-2">{day.entry ?? '—'}</td>
                                <td className="px-4 py-2">{day.exit ?? '—'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
