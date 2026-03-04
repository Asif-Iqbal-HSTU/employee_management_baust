import React from "react";
import { useForm, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { Save, ArrowLeft } from "lucide-react";
import { Link } from "@inertiajs/react";

export default function Edit({ request }: any) {
    const formatDate = (dateString: string) => {
        if (!dateString) return "";
        return dateString.split('T')[0]; // Format to YYYY-MM-DD for date inputs
    };

    const { data, setData, put, processing } = useForm({
        job_id: request.job_id || "",
        date_received: formatDate(request.date_received) || formatDate(request.submission_date) || "",
        received_by: request.received_by || "",
        initial_observation: request.initial_observation || "",
        expected_delivery: formatDate(request.expected_delivery) || "",
        assigned_to: request.assigned_to || "",
        assigned_phone: request.assigned_phone || "",
        status: request.status || "Pending",
        state: request.state || "",
        completed_actions: request.completed_actions || "",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("repair.update", request.id));
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Repair Requests', href: route('repair.index') }, { title: 'Update Status', href: '#' }]}>
            <Head title="Edit Repair Request" />
            <div className="max-w-4xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('repair.index')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to List</span>
                    </Link>
                </div>

                <div className="bg-white shadow-sm border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                        <h1 className="text-xl font-bold text-gray-900">
                            IT Repair Cell – Official Use
                        </h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Update the repair progress, status, and technical details for <strong>{request.job_id}</strong>
                        </p>
                    </div>

                    <form onSubmit={submit} className="p-6 space-y-8">
                        {/* Job Info Section */}
                        <div className="space-y-4">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Assignment Details</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Job ID / Ticket No</label>
                                    <input
                                        type="text"
                                        value={data.job_id}
                                        onChange={e => setData("job_id", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="e.g., 202625021335"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Date Received (Auto-populated)</label>
                                    <input
                                        type="date"
                                        value={data.date_received}
                                        readOnly
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed transition-all outline-none"
                                        title="Date received is pulled from submission date and cannot be edited."
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Received By</label>
                                    <input
                                        type="text"
                                        value={data.received_by}
                                        onChange={e => setData("received_by", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="Name of technician"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Expected Delivery Date</label>
                                    <input
                                        type="date"
                                        value={data.expected_delivery}
                                        onChange={e => setData("expected_delivery", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Technical Section */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Technical Status</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Current Status</label>
                                    <select
                                        value={data.status}
                                        onChange={e => setData("status", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none bg-white font-medium"
                                    >
                                        <option>Pending</option>
                                        <option>In Progress</option>
                                        <option>Completed</option>
                                        <option>Delivered</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">State / Progress Note</label>
                                    <input
                                        type="text"
                                        value={data.state}
                                        onChange={e => setData("state", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="e.g., Waiting for parts, Being tested"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Initial Observation / Remarks</label>
                                <textarea
                                    value={data.initial_observation}
                                    onChange={e => setData("initial_observation", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none h-24"
                                    placeholder="Enter initial diagnosis..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Assignment Section */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Expert Assignment</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Assigned To (Expert)</label>
                                    <input
                                        type="text"
                                        value={data.assigned_to}
                                        onChange={e => setData("assigned_to", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="Expert name"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-700">Expert Cellphone</label>
                                    <input
                                        type="text"
                                        value={data.assigned_phone}
                                        onChange={e => setData("assigned_phone", e.target.value)}
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                        placeholder="Phone number"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Completed Actions Section */}
                        <div className="space-y-4 pt-4 border-t border-gray-100">
                            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Completed Actions</h2>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-700">Actions Taken & Results</label>
                                <textarea
                                    value={data.completed_actions}
                                    onChange={e => setData("completed_actions", e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none h-32"
                                    placeholder="List all steps taken to resolve the issue..."
                                ></textarea>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="flex justify-end pt-6">
                            <button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                            >
                                <Save size={20} />
                                {processing ? "Saving..." : "Save Technical Details"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
