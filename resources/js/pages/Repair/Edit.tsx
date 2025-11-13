import React from "react";
import { useForm, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

export default function Edit({ request }: any) {
    const { data, setData, put, processing } = useForm({
        job_id: request.job_id || "",
        date_received: request.date_received || "",
        received_by: request.received_by || "",
        initial_observation: request.initial_observation || "",
        expected_delivery: request.expected_delivery || "",
        assigned_to: request.assigned_to || "",
        assigned_phone: request.assigned_phone || "",
        status: request.status || "Pending",
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route("repair.update", request.id));
    };

    return (
        <AppLayout title="IT Repair Cell Update">
            <Head title="Edit Repair Request" />
            <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6">
                <h1 className="text-2xl font-bold mb-6 text-center">
                    IT Repair Cell – Official Use
                </h1>

                <form onSubmit={submit} className="space-y-6">
                    {/* Job Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold mb-1">Job ID / Ticket No</label>
                            <input
                                type="text"
                                name="job_id"
                                value={data.job_id}
                                onChange={e => setData("job_id", e.target.value)}
                                className="input"
                                placeholder="e.g., JOB-2025-001"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Date Received</label>
                            <input
                                type="date"
                                name="date_received"
                                value={data.date_received}
                                onChange={e => setData("date_received", e.target.value)}
                                className="input"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Received By</label>
                            <input
                                type="text"
                                name="received_by"
                                value={data.received_by}
                                onChange={e => setData("received_by", e.target.value)}
                                className="input"
                                placeholder="Person receiving the device"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Expected Delivery Date</label>
                            <input
                                type="date"
                                name="expected_delivery"
                                value={data.expected_delivery}
                                onChange={e => setData("expected_delivery", e.target.value)}
                                className="input"
                            />
                        </div>
                    </div>

                    {/* Observation */}
                    <div>
                        <label className="block font-semibold mb-1">Initial Observation / Remarks</label>
                        <textarea
                            name="initial_observation"
                            value={data.initial_observation}
                            onChange={e => setData("initial_observation", e.target.value)}
                            className="input h-28"
                            placeholder="Add any initial diagnosis or remarks here"
                        ></textarea>
                    </div>

                    {/* Assignment */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block font-semibold mb-1">Assigned To (Expert Name)</label>
                            <input
                                type="text"
                                name="assigned_to"
                                value={data.assigned_to}
                                onChange={e => setData("assigned_to", e.target.value)}
                                className="input"
                                placeholder="e.g., John Doe"
                            />
                        </div>
                        <div>
                            <label className="block font-semibold mb-1">Expert Phone Number</label>
                            <input
                                type="text"
                                name="assigned_phone"
                                value={data.assigned_phone}
                                onChange={e => setData("assigned_phone", e.target.value)}
                                className="input"
                                placeholder="e.g., 017XXXXXXXX"
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block font-semibold mb-1">Current Status</label>
                        <select
                            name="status"
                            value={data.status}
                            onChange={e => setData("status", e.target.value)}
                            className="input"
                        >
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Completed</option>
                            <option>Delivered</option>
                        </select>
                    </div>

                    {/* Submit */}
                    <div className="text-right">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700"
                        >
                            {processing ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
