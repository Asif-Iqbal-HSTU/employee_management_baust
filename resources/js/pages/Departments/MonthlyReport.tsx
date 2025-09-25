import React, { useRef } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function MonthlyReport({ department, report, monthName }: any) {
    const tableRef = useRef<HTMLTableElement>(null);

    const handleDownload = () => {
        const doc = new jsPDF();

        // Title
        doc.setFontSize(14);
        doc.text(`${department.short_name} - ${monthName} - Monthly Report`, 14, 15);

        // Convert table to PDF
        autoTable(doc, {
            html: tableRef.current!,
            startY: 25,
            theme: "grid",
            styles: { fontSize: 10 },
            headStyles: { fillColor: [41, 128, 185] }, // Blue header
        });

        // Save file
        doc.save(`${department.short_name}-${monthName}-report.pdf`);
    };

    return (
        <AppLayout breadcrumbs={[{ title: "Back", href: "/departments" }]}>
            <Head title={`${department.short_name} - Monthly Report`} />
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-xl font-bold">
                        {department.short_name} - {monthName} - Monthly Report
                    </h1>
                    <button
                        onClick={handleDownload}
                        className="bg-green-800 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Download PDF
                    </button>
                </div>

                <table ref={tableRef} className="min-w-full border">
                    <thead className="bg-gray-100">
                    <tr>
                        {/*<th className="px-4 py-2 border">id</th>*/}
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
                            {/*<td className="px-4 py-2 border">{row.id}</td>*/}
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
