import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import axios from 'axios';

export default function Index({ users, departments, designations }: any) {
    const [assignments, setAssignments] = useState({});
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');

    const handleSelectChange = (employeeId: string, field: string, value: string) => {
        setAssignments((prev: any) => ({
            ...prev,
            [employeeId]: {
                ...prev[employeeId],
                [field]: value,
            },
        }));
    };

    const handleSave = async (employeeId: string) => {
        const data = assignments[employeeId];
        if (!data?.department_id || !data?.designation_id) return;

        await axios.post('/user-assignments', {
            employee_id: employeeId,
            department_id: data.department_id,
            designation_id: data.designation_id,
        });

        alert('Saved successfully!');
    };

    const filteredUsers = users.filter((user: any) =>
        user.employee_id.toLowerCase().includes(searchId.toLowerCase()) &&
        user.name.toLowerCase().includes(searchName.toLowerCase())
    );

    return (
        <AppLayout>
            <Head title="Assign Departments & Designations" />
            <div className="p-4 space-y-4">
                <h1 className="text-xl font-bold">Assign Departments and Designations</h1>

                {/* Search Inputs */}
                <div className="flex flex-col md:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search by Employee ID"
                        className="border rounded px-3 py-2 w-full md:w-1/2 focus:outline-none focus:ring focus:ring-blue-300"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                    />
                    <input
                        type="text"
                        placeholder="Search by Name"
                        className="border rounded px-3 py-2 w-full md:w-1/2 focus:outline-none focus:ring focus:ring-green-300"
                        value={searchName}
                        onChange={(e) => setSearchName(e.target.value)}
                    />
                </div>

                {/* Table */}
                <div className="overflow-auto">
                    <table className="min-w-full bg-white border rounded">
                        <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2">Employee ID</th>
                            <th className="px-4 py-2">Name</th>
                            <th className="px-4 py-2">Department</th>
                            <th className="px-4 py-2">Designation</th>
                            <th className="px-4 py-2">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.map((user: any) => (
                            <tr key={user.employee_id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-2">{user.employee_id}</td>
                                <td className="px-4 py-2">{user.name}</td>
                                <td className="px-4 py-2">
                                    <select
                                        className="border rounded px-2 py-1"
                                        value={assignments[user.employee_id]?.department_id || user.assignment?.department?.id || ''}
                                        onChange={(e) =>
                                            handleSelectChange(user.employee_id, 'department_id', e.target.value)
                                        }
                                    >
                                        <option value="">-- Select --</option>
                                        {departments.map((dept: any) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.short_name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-2">
                                    <select
                                        className="border rounded px-2 py-1"
                                        value={assignments[user.employee_id]?.designation_id || user.assignment?.designation?.id || ''}
                                        onChange={(e) =>
                                            handleSelectChange(user.employee_id, 'designation_id', e.target.value)
                                        }
                                    >
                                        <option value="">-- Select --</option>
                                        {designations.map((des: any) => (
                                            <option key={des.id} value={des.id}>
                                                {des.designation_name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-2">
                                    <button
                                        onClick={() => handleSave(user.employee_id)}
                                        className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                    >
                                        Save
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {filteredUsers.length === 0 && (
                            <tr>
                                <td colSpan={5} className="text-center px-4 py-4 text-gray-500">
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
