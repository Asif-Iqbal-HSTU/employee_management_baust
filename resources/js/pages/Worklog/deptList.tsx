import React, { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import type { BreadcrumbItem } from "@/types";

export default function DeptList({ departments, worklogs }: any) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: "Department-wise worklog", href: "/worklog" },
    ];

    const today = new Date().toISOString().split("T")[0];

    // 🔹 Filter date state
    const [filterDate, setFilterDate] = useState<string>("");

    // 🔹 Filtered logs
    const filteredWorklogs = filterDate
        ? worklogs.filter((log: any) => log.date === filterDate)
        : worklogs;

    // Group worklogs by date
    const groupedWorklogs = filteredWorklogs.reduce((acc: any, log: any) => {
        if (!acc[log.date]) acc[log.date] = [];
        acc[log.date].push(log);
        return acc;
    }, {});

    const { data, setData, post, processing, reset, errors } = useForm({
        date: today,
        startTime: "",
        endTime: "",
        taskDescription: "",
        status: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route("worklog.store"), {
            onSuccess: () => {
                reset("startTime", "endTime", "taskDescription", "status");
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Worklog Manager" />
            <div className="p-6">
                <h1 className="text-xl font-bold mb-6">My Worklog</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* -------------------- Form Section -------------------- */}
                    <div className="block rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition">
                        <h1 className="text-xl font-bold mb-6">Upload New Work</h1>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Date (auto-today, uneditable) */}
                            <div>
                                <label className="block font-medium">Date</label>
                                <input
                                    type="date"
                                    className="w-full border rounded-lg p-2 bg-gray-100 cursor-not-allowed"
                                    value={today}
                                    readOnly
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium">Start Time (optional)</label>
                                    <input
                                        type="time"
                                        className="w-full border rounded-lg p-2"
                                        value={data.startTime}
                                        onChange={(e) => setData("startTime", e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium">End Time (optional)</label>
                                    <input
                                        type="time"
                                        className="w-full border rounded-lg p-2"
                                        value={data.endTime}
                                        onChange={(e) => setData("endTime", e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium">Task Description</label>
                                <textarea
                                    className="w-full border rounded-lg p-2"
                                    rows={4}
                                    value={data.taskDescription}
                                    onChange={(e) =>
                                        setData("taskDescription", e.target.value)
                                    }
                                />
                                {errors.taskDescription && (
                                    <p className="text-red-500 text-sm">
                                        {errors.taskDescription}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block font-medium">Status (optional)</label>
                                <input
                                    type="text"
                                    className="w-full border rounded-lg p-2"
                                    placeholder="Completed / Ongoing / Pending"
                                    value={data.status}
                                    onChange={(e) => setData("status", e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-60"
                            >
                                {processing ? "Saving..." : "Submit Worklog"}
                            </button>
                        </form>
                    </div>

                    {/* -------------------- Worklog List Section -------------------- */}
                    <div className="block rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition flex flex-col">
                        <div className="flex justify-between items-center mb-4">
                            <h1 className="text-xl font-bold">Uploaded Works</h1>

                            {/* 🔹 Filter by Date */}
                            <input
                                type="date"
                                className="border rounded-lg p-2 text-sm"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                            />
                        </div>

                        {Object.keys(groupedWorklogs).length === 0 ? (
                            <p className="text-gray-500">No worklogs found.</p>
                        ) : (
                            // 🔹 Scrollable list container
                            <div className="space-y-4 overflow-y-auto max-h-[450px] pr-2">
                                {Object.keys(groupedWorklogs).map((date) => (
                                    <div key={date}>
                                        <h2 className="font-semibold text-lg text-blue-600 mb-2">
                                            {date}
                                        </h2>
                                        <ol className="list-decimal pl-5 space-y-2">
                                            {groupedWorklogs[date].map(
                                                (log: any, index: number) => (
                                                    <li
                                                        key={index}
                                                        className="border-b pb-1"
                                                    >
                                                        <div className="font-medium">
                                                            {log.taskDescription}
                                                        </div>
                                                        <div>
                                                            {log.startTime} - {log.endTime}
                                                        </div>
                                                        {log.status && (
                                                            <div className="text-sm text-blue-500">
                                                                Status: {log.status}
                                                            </div>
                                                        )}
                                                    </li>
                                                )
                                            )}
                                        </ol>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="p-6">
                <h1 className="text-xl font-bold mb-6">All Departments</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6">
                    {departments.map((dept: any) => (
                        <Link
                            key={dept.id}
                            href={route("departments.employees", dept.id)}
                            className="block rounded-2xl border bg-card p-6 shadow-sm hover:shadow-md transition"
                        >
                            <h2 className="text-lg font-semibold">{dept.short_name}</h2>
                        </Link>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
