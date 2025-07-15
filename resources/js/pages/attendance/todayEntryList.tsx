import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Today\'s Entry',
        href: '/today-entry',
    },
];

export default function TodayEntryList({ entries, date }: { entries: any[], date: string }) {
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');

    const filteredEntries = entries.filter((entry) =>
        entry.employee_id.toLowerCase().includes(searchId.toLowerCase()) &&
        entry.name.toLowerCase().includes(searchName.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Today's Entry" />
            <div className="flex flex-col gap-4 p-4">
                <h2 className="text-xl font-semibold text-gray-700">Today's Entry: {date}</h2>

                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search by Employee ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="w-full md:w-1/2 rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
                    />
                    <input
                        type="text"
                        placeholder="Search by Name"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                        className="w-full md:w-1/2 rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring focus:ring-green-300"
                    />
                </div>

                <div className="flex justify-end">
                    <a
                        href="/today-entry/export"
                        className="inline-block px-4 py-2 mb-2 text-white bg-green-600 rounded hover:bg-green-700"
                    >
                        Download Excel
                    </a>
                </div>

                <div className="overflow-auto rounded-lg shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-600">Employee ID</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-600">Name</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-600">Entry Time</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredEntries.map((entry, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-blue-700 font-medium">{entry.employee_id}</td>
                                <td className="px-4 py-2">{entry.name}</td>
                                <td className="px-4 py-2">{entry.entry_time ?? 'N/A'}</td>
                            </tr>
                        ))}
                        {filteredEntries.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-4 py-4 text-center text-gray-400">
                                    No matching entries found.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>
        </AppLayout>
    );
}
