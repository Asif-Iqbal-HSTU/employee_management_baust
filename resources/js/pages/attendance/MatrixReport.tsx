import AppLayout from "@/layouts/app-layout";
import { Head } from "@inertiajs/react";

export default function MatrixReport({ matrix, dates }) {
    return (
        <AppLayout>
            <Head title="Attendance Matrix Report" />

            <div className="p-4 overflow-auto">
                <button
                    onClick={() => window.open(route("attendance.matrix.pdf"), "_blank")}
                    className="mb-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded"
                >
                    Download PDF
                </button>

                <table className="min-w-max border">
                    <thead>
                    <tr className="bg-gray-200">
                        <th className="border px-2 py-1">Employee</th>
                        <th className="border px-2 py-1">Designation</th>
                        <th className="border px-2 py-1 text-xs">TWD</th>
                        <th className="border px-2 py-1 text-xs">TP</th>
                        <th className="border px-2 py-1 text-xs">TA</th>
                        <th className="border px-2 py-1 text-xs">TEL</th>
                        <th className="border px-2 py-1 text-xs">TLE</th>


                        {dates.map((d) => (
                            <th key={d} className="border px-2 py-1 text-xs">
                                {d}
                            </th>
                        ))}
                    </tr>
                    </thead>

                    <tbody>
                    {matrix.map((row) => (
                        <tr key={row.employee_id}>
                            <td className="border px-2 py-1">{row.name}</td>
                            <td className="border px-2 py-1">{row.designation}</td>
                            <td className="border px-2 py-1 text-center">{row.TWD}</td>
                            <td className="border px-2 py-1 text-center">{row.TP}</td>
                            <td className="border px-2 py-1 text-center">{row.TA}</td>
                            <td className="border px-2 py-1 text-center">{row.TEL}</td>
                            <td className="border px-2 py-1 text-center">{row.TLE}</td>
                            {dates.map((d) => (
                                <td
                                    key={d}
                                    className="border px-2 py-1 text-center"
                                >
                                    {row.days[d]}
                                </td>
                            ))}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
