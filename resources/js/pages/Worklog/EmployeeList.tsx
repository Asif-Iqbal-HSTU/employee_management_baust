import React, { useState } from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";
import axios from "axios";

interface Employee {
    employee_id: string;
    name: string;
    designation?: string;
}

export default function EmployeeList({ department, employees }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Departments", href: "/worklog" },
        { title: department.short_name || department.name, href: "#" },
    ];

    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [worklogs, setWorklogs] = useState<any[]>([]);
    const [filteredWorklogs, setFilteredWorklogs] = useState<any[]>([]);
    const [filterDate, setFilterDate] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const openWorklogModal = async (employee: Employee) => {
        setSelectedEmployee(employee);
        setLoading(true);
        try {
            const res = await axios.get(route("employees.worklogs", employee.employee_id));
            setWorklogs(res.data);
            setFilteredWorklogs(res.data);
        } catch (err) {
            console.error("Error fetching worklogs", err);
        } finally {
            setLoading(false);
        }
    };

    const closeModal = () => {
        setSelectedEmployee(null);
        setWorklogs([]);
        setFilteredWorklogs([]);
        setFilterDate("");
    };

    // 🔹 Filter by date handler
    const handleDateFilter = (date: string) => {
        setFilterDate(date);
        if (!date) {
            setFilteredWorklogs(worklogs);
        } else {
            const filtered = worklogs.filter((log: any) => log.date === date);
            setFilteredWorklogs(filtered);
        }
    };

    // 🔹 Group worklogs by date
    const groupedWorklogs = filteredWorklogs.reduce((acc: any, log: any) => {
        if (!acc[log.date]) acc[log.date] = [];
        acc[log.date].push(log);
        return acc;
    }, {});

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`${department.short_name || department.name} - Employees`} />

            <div className="p-6">
                <h1 className="text-2xl font-bold mb-6">Employee List</h1>

                {employees.length === 0 ? (
                    <p className="text-gray-500">No employees found in this department.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {employees.map((emp: Employee) => (
                            <div
                                key={emp.employee_id}
                                onClick={() => openWorklogModal(emp)}
                                className="cursor-pointer border rounded-xl p-4 hover:shadow-md bg-white transition"
                            >
                                <h2 className="font-semibold text-lg">{emp.name}</h2>
                                <p className="text-sm text-gray-500">
                                    {emp.designation || "—"}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ------------------ Modal ------------------ */}
            {selectedEmployee && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl w-full max-w-3xl p-6 shadow-2xl relative">
                        {/* Close button */}
                        <button
                            onClick={closeModal}
                            className="absolute top-2 right-3 text-gray-600 hover:text-black text-xl"
                        >
                            &times;
                        </button>

                        {/* Modal header */}
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-bold">
                                    Worklogs of {selectedEmployee.name}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    {selectedEmployee.designation || ""}
                                </p>
                            </div>

                            {/* 🔹 Date filter field */}
                            <input
                                type="date"
                                className="border rounded-lg p-2 text-sm"
                                value={filterDate}
                                onChange={(e) => handleDateFilter(e.target.value)}
                            />
                        </div>

                        {/* Modal content */}
                        {loading ? (
                            <p>Loading...</p>
                        ) : filteredWorklogs.length === 0 ? (
                            <p className="text-gray-500">No worklogs available.</p>
                        ) : (
                            <div className="max-h-[70vh] overflow-y-auto space-y-4 pr-2">
                                {Object.keys(groupedWorklogs).map((date) => (
                                    <div key={date}>
                                        <h3 className="font-semibold text-blue-600 mb-2">
                                            {date}
                                        </h3>
                                        <ol className="list-decimal pl-5 space-y-2">
                                            {groupedWorklogs[date].map((log: any, index: number) => (
                                                <li key={index} className="border-b pb-1">
                                                    <div className="font-medium">
                                                        {log.startTime} - {log.endTime}
                                                    </div>
                                                    <div>{log.taskDescription}</div>
                                                    {log.status && (
                                                        <div className="text-sm text-blue-500">
                                                            Status: {log.status}
                                                        </div>
                                                    )}
                                                </li>
                                            ))}
                                        </ol>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
