import React, { useState } from "react";
import { Head, usePage, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Eye, Download, Edit, CheckCircle, Clock, Wrench, Truck, Plus } from "lucide-react";

export default function Index() {
    const { requests, auth, isMine }: any = usePage().props;
    const repairAdmins = ["25052", "21023", "25030", "24079", "25048"];
    const isAdmin = repairAdmins.includes(auth.user.employee_id);
    const [filter, setFilter] = useState("all");

    const filteredRequests = requests.data.filter((r: any) => {
        if (filter === "completed") return r.status === "Completed" || r.status === "Delivered";
        if (filter === "pending") return r.status === "Pending";
        if (filter === "in_progress") return r.status === "In Progress";
        return true;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Completed": return "bg-green-100 text-green-800 border-green-200";
            case "Delivered": return "bg-purple-100 text-purple-800 border-purple-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Pending": return <Clock size={14} className="mr-1" />;
            case "In Progress": return <Wrench size={14} className="mr-1" />;
            case "Completed": return <CheckCircle size={14} className="mr-1" />;
            case "Delivered": return <Truck size={14} className="mr-1" />;
            default: return null;
        }
    };

    return (
        <AppLayout>
            <Head title="Repair Requests" />
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isMine ? "My Repair Requests" : (isAdmin ? "IT Repair Dashboard" : "Department Repair Requests")}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {isMine
                                ? "Manage your personally submitted device repair requests"
                                : (isAdmin ? "Oversee and manage all pending and active repair jobs" : "Monitor repair requests from your department")}
                        </p>
                    </div>
                    <Link
                        href={route("repair.create")}
                        className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg"
                    >
                        <Plus size={18} />
                        <span>New Request</span>
                    </Link>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2">
                        <button
                            onClick={() => setFilter("all")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "all" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setFilter("pending")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "pending" ? "bg-yellow-50 text-yellow-700 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter("in_progress")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "in_progress" ? "bg-blue-50 text-blue-700 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                        >
                            In Progress
                        </button>
                        <button
                            onClick={() => setFilter("completed")}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${filter === "completed" ? "bg-green-50 text-green-700 shadow-sm" : "text-gray-500 hover:bg-gray-50"}`}
                        >
                            Completed
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Job Details</th>
                                    <th className="px-6 py-4 font-semibold">Department</th>
                                    <th className="px-6 py-4 font-semibold">Device</th>
                                    <th className="px-6 py-4 font-semibold">Status & State</th>
                                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredRequests.length > 0 ? (
                                    filteredRequests.map((r: any) => (
                                        <tr key={r.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-gray-900">{r.job_id || "PENDING"}</div>
                                                <div className="text-xs text-gray-400 mt-1">
                                                    {new Date(r.created_at).toLocaleDateString()}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-700">{r.department}</div>
                                                <div className="text-xs text-gray-400 truncate w-32">{r.contact_person}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm font-medium text-gray-900">{r.device_type}</div>
                                                <div className="text-xs text-gray-400 truncate w-32">{r.brand_model}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(r.status)}`}>
                                                        {getStatusIcon(r.status)}
                                                        {r.status}
                                                    </span>
                                                    {r.state && (
                                                        <div className="text-xs text-gray-500 font-medium italic">
                                                            {r.state}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Link
                                                        href={route("repair.view", r.id)}
                                                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                        title="View Details"
                                                    >
                                                        <Eye size={18} />
                                                    </Link>
                                                    <a
                                                        href={route("repair.download", r.id)}
                                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                                        title="Download PDF"
                                                        target="_blank"
                                                    >
                                                        <Download size={18} />
                                                    </a>
                                                    {isAdmin && (
                                                        <Link
                                                            href={route("repair.edit", r.id)}
                                                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                                                            title="Update Status"
                                                        >
                                                            <Edit size={18} />
                                                        </Link>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                                            No repair requests found.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {isAdmin && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <CheckCircle className="text-green-500" size={20} />
                            Completed Actions Preview
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {requests.data.filter((r: any) => r.completed_actions).slice(0, 6).map((r: any) => (
                                <div key={r.id} className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-indigo-600 uppercase">{r.job_id}</span>
                                        <span className="text-[10px] text-gray-400">{new Date(r.updated_at).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 line-clamp-2 italic italic">
                                        "{r.completed_actions}"
                                    </p>
                                    <div className="mt-3 text-xs text-gray-500">
                                        Technician: {r.assigned_to || "N/A"}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
