import AppLayout from "@/layouts/app-layout";
import { Head, useForm } from "@inertiajs/react";

export default function MatrixForm({ departments }) {
    // Form #1: Matrix Report
    const { data, setData, post, processing } = useForm({
        department_id: "",
        start_date: "",
        end_date: "",
    });

    // Form #2: Summary Report
    const summaryForm = useForm({
        start_date: "",
        end_date: "",
    });

    const submitMatrix = (e) => {
        e.preventDefault();
        post(route("attendance.matrix.generate"));
    };

    const submitSummary = (e) => {
        e.preventDefault();
        summaryForm.post(route("attendance.summary.generate"));
    };

    return (
        <AppLayout>
            <Head title="Attendance Matrix" />

            <div className="p-6 max-w-xl mx-auto bg-white rounded shadow">
                <h2 className="text-xl font-bold mb-4">Attendance Matrix Generator</h2>

                {/* MATRIX FORM */}
                <form onSubmit={submitMatrix} className="space-y-4 mb-10">

                    <div>
                        <label className="block mb-1 font-medium">Department</label>
                        <select
                            className="w-full border px-3 py-2 rounded"
                            value={data.department_id}
                            onChange={(e) => setData("department_id", e.target.value)}
                        >
                            <option value="">Select Department</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>
                                    {d.dept_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">Start Date</label>
                        <input
                            type="date"
                            className="w-full border px-3 py-2 rounded"
                            value={data.start_date}
                            onChange={(e) => setData("start_date", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">End Date</label>
                        <input
                            type="date"
                            className="w-full border px-3 py-2 rounded"
                            value={data.end_date}
                            onChange={(e) => setData("end_date", e.target.value)}
                        />
                    </div>

                    <button
                        disabled={processing}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded"
                    >
                        {processing ? "Generating..." : "Generate Report"}
                    </button>
                </form>

                {/* SUMMARY FORM */}
                <h2 className="text-xl font-bold mb-4">Summary Report (All Departments)</h2>

                <form onSubmit={submitSummary} className="space-y-4">

                    <div>
                        <label className="block mb-1 font-medium">Start Date</label>
                        <input
                            type="date"
                            className="w-full border px-3 py-2 rounded"
                            value={summaryForm.data.start_date}
                            onChange={(e) => summaryForm.setData("start_date", e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="block mb-1 font-medium">End Date</label>
                        <input
                            type="date"
                            className="w-full border px-3 py-2 rounded"
                            value={summaryForm.data.end_date}
                            onChange={(e) => summaryForm.setData("end_date", e.target.value)}
                        />
                    </div>

                    <button
                        disabled={summaryForm.processing}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
                    >
                        {summaryForm.processing ? "Generating..." : "Generate Summary"}
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
