import React from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

export default function Index() {
    const { requests, auth }: any = usePage().props;
    const isAdmin = auth.user.employee_id === "25052";

    return (
        <AppLayout title="Repair Requests">
            <Head title="Repair Requests" />
            <div className="p-6 bg-white rounded-2xl shadow">
                <h1 className="text-2xl font-bold mb-4">
                    {isAdmin ? "All Repair Requests" : "My Repair Requests"}
                </h1>

                <table className="min-w-full border">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="p-2 border">Job ID</th>
                        <th className="p-2 border">Department</th>
                        <th className="p-2 border">Device</th>
                        <th className="p-2 border">Problem</th>
                        <th className="p-2 border">Status</th>
                        {isAdmin && <th className="p-2 border">Action</th>}
                    </tr>
                    </thead>
                    <tbody>
                    {requests.data.map((r: any) => (
                        <tr key={r.id} className="border-t">
                            <td className="p-2">{r.job_id || "-"}</td>
                            <td className="p-2">{r.department}</td>
                            <td className="p-2">{r.device_type}</td>
                            <td className="p-2">{r.problem_description?.slice(0, 40)}</td>

                            <td className="p-2">
                                {!isAdmin && r.status !== "Pending" ? (
                                    <Link
                                        href={route("repair.view", r.id)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        {r.status}
                                    </Link>
                                ) : (
                                    r.status
                                )}
                            </td>

                            {isAdmin && (
                                <td className="p-2 text-center">
                                    <Link
                                        href={route("repair.edit", r.id)}
                                        className="text-blue-600 hover:underline"
                                    >
                                        Update
                                    </Link>
                                </td>
                            )}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
