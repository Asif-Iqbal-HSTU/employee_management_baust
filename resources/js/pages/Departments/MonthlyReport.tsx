import React, { useRef, useState } from "react";
import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MonthlyReport({ department, report, monthName, startDate, endDate }: any) {
    const tableRef = useRef<HTMLTableElement>(null);
    const [dates, setDates] = useState({
        startDate: startDate || "",
        endDate: endDate || "",
    });

    const handleDownload = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(`${department.short_name} - ${monthName} - Report`, 14, 15);
        autoTable(doc, { html: tableRef.current!, startY: 25, theme: "grid", styles: { fontSize: 10 }, headStyles: { fillColor: [41, 128, 185] } });
        doc.save(`${department.short_name}-${monthName}-report.pdf`);
    };

    const handleFilter = () => {
        router.get(route("departments.dateRangeReport", department.id), {
            startDate: dates.startDate,
            endDate: dates.endDate,
        });
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Department-wise Report", href: "/departments" }]}>
            <Head title={`${department.short_name} - Report`} />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold">{department.short_name} - {monthName}</h1>
                    <button onClick={handleDownload} className="bg-green-800 text-white px-4 py-2 rounded hover:bg-green-700">
                        Download PDF
                    </button>
                </div>

                {/* 🔹 Date Range Filter */}
                <div className="flex gap-4 mb-6 items-end">
                    <div>
                        <label className="block text-sm font-semibold mb-1">Start Date</label>
                        <input
                            type="date"
                            className="border rounded px-2 py-1"
                            value={dates.startDate}
                            onChange={(e) => setDates({ ...dates, startDate: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold mb-1">End Date</label>
                        <input
                            type="date"
                            className="border rounded px-2 py-1"
                            value={dates.endDate}
                            onChange={(e) => setDates({ ...dates, endDate: e.target.value })}
                        />
                    </div>
                    <button
                        onClick={handleFilter}
                        className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Apply
                    </button>
                </div>

                {/* 🔹 Table */}
                <table ref={tableRef} className="min-w-full border">
                    <thead className="bg-gray-100">
                    <tr>
                        <th className="px-4 py-2 border">SL</th>
                        <th className="px-4 py-2 border">Name</th>
                        <th className="px-4 py-2 border">Designation</th>
                        <th className="px-4 py-2 border">Workdays</th>
                        <th className="px-4 py-2 border">Present</th>
                        <th className="px-4 py-2 border">Absent</th>
                        <th className="px-4 py-2 border">Late</th>
                        <th className="px-4 py-2 border">Early Leave</th>
                    </tr>
                    </thead>
                    <tbody>
                    {report.map((row: any, idx: number) => (
                        <tr key={idx}>
                            <td className="px-4 py-2 border">{idx + 1}</td>
                            <td className="px-4 py-2 border">{row.name}</td>
                            <td className="px-4 py-2 border">{row.designation}</td>
                            <td className="px-4 py-2 border">{row.total_days}</td>
                            <td className="px-4 py-2 border">{row.present}</td>
                            <td className="px-4 py-2 border">{row.absent}</td>
                            <td className="px-4 py-2 border">{row.late}</td>
                            <td className="px-4 py-2 border">{row.early_leave}</td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </AppLayout>
    );
}
