import React from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

export default function View({ request }: any) {
    return (
        <AppLayout title="Repair Details">
            <Head title="Repair Details" />
            <div className="max-w-3xl mx-auto bg-white shadow rounded-2xl p-6">
                <h1 className="text-2xl font-bold mb-4 text-center">Repair Request Details</h1>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold">Job ID</label>
                            <p className="border rounded-md p-2 bg-gray-50">{request.job_id || "-"}</p>
                        </div>
                        <div>
                            <label className="font-semibold">Date Received</label>
                            <p className="border rounded-md p-2 bg-gray-50">{request.date_received || "-"}</p>
                        </div>

                        <div>
                            <label className="font-semibold">Received By</label>
                            <p className="border rounded-md p-2 bg-gray-50">{request.received_by || "-"}</p>
                        </div>
                        <div>
                            <label className="font-semibold">Expected Delivery</label>
                            <p className="border rounded-md p-2 bg-gray-50">{request.expected_delivery || "-"}</p>
                        </div>
                    </div>

                    <div>
                        <label className="font-semibold">Initial Observation</label>
                        <p className="border rounded-md p-2 bg-gray-50 min-h-[60px]">{request.initial_observation || "-"}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="font-semibold">Assigned To</label>
                            <p className="border rounded-md p-2 bg-gray-50">{request.assigned_to || "-"}</p>
                        </div>
                        <div>
                            <label className="font-semibold">Expert Phone</label>
                            <p className="border rounded-md p-2 bg-gray-50">{request.assigned_phone || "-"}</p>
                        </div>
                    </div>

                    <div>
                        <label className="font-semibold">Status</label>
                        <p className="border rounded-md p-2 bg-gray-50">{request.status}</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
