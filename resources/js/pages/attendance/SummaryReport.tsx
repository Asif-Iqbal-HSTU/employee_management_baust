import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

export default function SummaryReport({ summary, dates }) {
    return (
        <AppLayout>
            <Head title="Summary Report" />

            <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">

                <button
                    onClick={() => window.open(route("attendance.summary.pdf"), "_blank")}
                    className="mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                    Download PDF
                </button>

                <h2 className="text-2xl font-bold mb-4">Summary Report</h2>

                <table className="w-full border">
                    <tbody>
                    <tr><td className="border px-3 py-2">Total Workdays</td><td className="border px-3 py-2">{summary.total_workdays}</td></tr>
                    <tr><td className="border px-3 py-2">Total Present</td><td className="border px-3 py-2">{summary.present}</td></tr>
                    <tr><td className="border px-3 py-2">Total Absent</td><td className="border px-3 py-2">{summary.absent}</td></tr>
                    <tr><td className="border px-3 py-2">Late Entry</td><td className="border px-3 py-2">{summary.late_entry}</td></tr>
                    <tr><td className="border px-3 py-2">Early Leave</td><td className="border px-3 py-2">{summary.early_leave}</td></tr>
                    </tbody>
                </table>

            </div>
        </AppLayout>
    );
}
