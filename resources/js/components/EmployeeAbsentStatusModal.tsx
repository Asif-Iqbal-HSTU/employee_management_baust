import { useState, useEffect } from "react";
import { router } from "@inertiajs/react";

export default function EmployeeStatusModal({ employee, isOpen, onClose, date }) {
    const [status, setStatus] = useState("absent");
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    console.log(employee);
    console.log(date);
    useEffect(() => {
        if (employee) {
            // default values
            setStatus("late entry");
            setRemarks(employee.remarks ?? "");
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

    const submitForm = () => {
        setLoading(true);

        router.post(
            "/dept-head/attendance/update-status/absent",
            {
                employee_id: employee.employee_id,
                date: date,
                status,
                remarks,
            },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setLoading(false);
                    alert("✔ Attendance Updated Successfully");
                    onClose();
                },
                onError: () => {
                    setLoading(false);
                    alert("❌ Failed to Update Attendance");
                },
            }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 bg-opacity-40">
            <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <h2 className="mb-4 text-xl font-bold">
                    Update Attendance — {employee.name}
                </h2>

                {/* Employee Info */}
                <div className="mb-4 text-sm text-gray-600">
                    <p><strong>ID:</strong> {employee.employee_id}</p>
                    <p><strong>Date:</strong> {date}</p>
                    {/*<p><strong>In Time:</strong> {employee.in_time ?? "—"}</p>
                    <p><strong>Out Time:</strong> {employee.out_time ?? "—"}</p>*/}
                </div>

                {/* Status Radio Buttons */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold">Status</label>

                    <div className="mt-2 flex gap-4">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="status"
                                value="absent"
                                checked={status === "absent"}
                                onChange={() => setStatus("absent")}
                            />
                            Absent
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="status"
                                value="rescheduled"
                                checked={status === "rescheduled"}
                                onChange={() => setStatus("rescheduled")}
                            />
                            Rescheduled
                        </label>

                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="status"
                                value="On Leave"
                                checked={status === "On Leave"}
                                onChange={() => setStatus("On Leave")}
                            />
                            On Leave
                        </label>
                    </div>
                </div>

                {/* Remarks */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold">Remarks</label>
                    <textarea
                        className="mt-1 w-full rounded border p-2 text-sm"
                        rows={3}
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        placeholder="Add remarks"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="rounded bg-gray-300 px-4 py-2 text-sm hover:bg-gray-400"
                    >
                        Cancel
                    </button>

                    <button
                        onClick={submitForm}
                        disabled={loading}
                        className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
}
