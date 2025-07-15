import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Dialog } from '@headlessui/react';
import axios from 'axios';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'All Employee Attendance',
        href: '/allEmployeeAttendance',
    },
];

export default function AllEmployeeAttendance({ users }: { users: any[] }) {
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');

    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [attendanceData, setAttendanceData] = useState<any>(null);
    const [open, setOpen] = useState(false);

    const openModal = async (user: any) => {
        setSelectedUser(user);
        const res = await axios.get(`/employee-attendance/${user.employee_id}`);
        setAttendanceData(res.data);
        setOpen(true);
    };

    const filteredUsers = users.filter((user) =>
        user.employee_id.toLowerCase().includes(searchId.toLowerCase()) &&
        user.name.toLowerCase().includes(searchName.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="All Employee Attendance" />
            <div className="flex flex-col gap-4 p-4">
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
                        href="/employee-attendance/export"
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
                            <th className="px-4 py-2 text-left font-medium text-gray-600">Role</th>
                            <th className="px-4 py-2 text-left font-medium text-gray-600">Card Info</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                        {filteredUsers.map((user, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                                <td className="px-4 py-2">
                                    <Link href={`/employee-attendance/${user.employee_id}`} className="text-blue-600 hover:underline">
                                        {user.employee_id}
                                    </Link>
                                </td>
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2">{user.role}</td>
                                <td className="px-4 py-2">{user.card_info}</td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-4 py-4 text-center text-gray-400">
                                    No matching users found.
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
