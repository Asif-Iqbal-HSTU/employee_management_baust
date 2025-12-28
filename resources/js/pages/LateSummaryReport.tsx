import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRef } from 'react';
import { router } from '@inertiajs/react';

type SummaryRow = {
    department: string;
    total: number;
    late: number;
    absent: number;
};

type Employee = {
    employee_id: string;
    name: string;
    designation: string;
    in_time?: string;
};

type Props = {
    date: string;
    summaryTable: SummaryRow[];
    lateDetails: Record<string, Employee[]>;
    absentDetails: Record<string, Employee[]>;
};

export default function LateSummaryReport({ date, summaryTable, lateDetails, absentDetails }: Props) {
    const tablesRef = useRef<HTMLDivElement>(null);

    const handleDownload0 = () => {
        const doc = new jsPDF('p', 'pt', 'a4');

        doc.setFontSize(13);
        doc.text(`Late & Absent Employees Summary Report - ${date}`, 40, 40);
        doc.setFontSize(10);
        doc.text('(Employees entering after 08:00 AM are considered late.)', 40, 55);

        autoTable(doc, {
            html: tablesRef.current!.querySelector('#summary-table') as HTMLTableElement,
            startY: 70,
            theme: 'grid',
            styles: { fontSize: 8 },
            columnStyles: {
                0: { cellWidth: 140 }, // Department
                1: { cellWidth: 80 },  // Total
                2: { cellWidth: 80 },  // Late
                3: { cellWidth: 80 },  // Not Present
            },
            tableWidth: 'wrap',
        });


        let currentY = (doc as any).lastAutoTable.finalY + 30;

        Object.entries(lateDetails).forEach(([dept, employees]) => {
            doc.setFontSize(11);
            doc.text(`Late - ${dept}`, 40, currentY);
            currentY += 10;

            autoTable(doc, {
                html: tablesRef.current!.querySelector(`#late-${dept}`) as HTMLTableElement,
                startY: currentY,
                theme: 'grid',
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 80 },  // Employee ID
                    1: { cellWidth: 160 }, // Name
                    2: { cellWidth: 120 }, // Designation
                    3: { cellWidth: 80 },  // Entry Time
                },
                tableWidth: 'wrap',
            });


            currentY = (doc as any).lastAutoTable.finalY + 20;
        });

        Object.entries(absentDetails).forEach(([dept, employees]) => {
            doc.setFontSize(11);
            doc.text(`Not Present - ${dept}`, 40, currentY);
            currentY += 10;

            autoTable(doc, {
                html: tablesRef.current!.querySelector(`#absent-${dept}`) as HTMLTableElement,
                startY: currentY,
                theme: 'grid',
                styles: { fontSize: 8 },
                columnStyles: {
                    0: { cellWidth: 80 },  // Employee ID
                    1: { cellWidth: 160 }, // Name
                    2: { cellWidth: 120 }, // Designation
                },
                tableWidth: 'wrap',
            });


            currentY = (doc as any).lastAutoTable.finalY + 20;
        });

        doc.save(`Late_Absent_Summary_${date}.pdf`);
    };

    const handleDownload1 = () => {
        router.post('/reports/late-summary/download', {
            date,
            summaryTable,
            lateDetails,
            absentDetails,
        }, {
            preserveScroll: true,
        });
    };

    const handleDownload = () => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = '/reports/late-summary/download';
        form.target = '_blank';

        // CSRF token
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            alert('CSRF token missing!');
            return;
        }

        const csrfInput = document.createElement('input');
        csrfInput.type = 'hidden';
        csrfInput.name = '_token';
        csrfInput.value = token;
        form.appendChild(csrfInput);

        // Add the date as hidden input
        const dateInput = document.createElement('input');
        dateInput.type = 'hidden';
        dateInput.name = 'date';
        dateInput.value = date;
        form.appendChild(dateInput);

        document.body.appendChild(form);
        form.submit();
        form.remove();
    };



    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/' }]}>
            <Head title="Late & Absent Summary Report" />

            <div className="space-y-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Late & Absent Employees Summary Report for {date}</h1>
                        <p className="text-sm text-gray-600">(Employees entering after 08:00 AM are considered late.)</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <input
                            type="date"
                            value={date}
                            onChange={(e) =>
                                router.get(
                                    route('late.summary.report'),
                                    { date: e.target.value },
                                    { preserveScroll: true }
                                )
                            }
                            className="rounded border px-3 py-2 text-sm"
                        />

                        <button
                            onClick={handleDownload}
                            className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800"
                        >
                            Download PDF
                        </button>
                    </div>

                    {/*<button onClick={handleDownload} className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800">
                        Download PDF
                    </button>*/}
                </div>

                <div ref={tablesRef}>
                    {/* Summary Table */}
                    <div className="rounded border bg-gray-50 p-4">
                        <h2 className="mb-2 text-lg font-bold">Department Summary</h2>
                        <table id="summary-table" className="min-w-full border text-left text-sm">
                            <thead className="bg-gray-100">
                                <tr>
                                    <th className="border px-3 py-2">Department</th>
                                    <th className="border px-3 py-2">Total Employees</th>
                                    <th className="border px-3 py-2">Late</th>
                                    <th className="border px-3 py-2">Not Present</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summaryTable.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="border px-3 py-2">{row.department}</td>
                                        <td className="border px-3 py-2 text-center">{row.total}</td>
                                        <td className="border px-3 py-2 text-center">{row.late}</td>
                                        <td className="border px-3 py-2 text-center">{row.absent}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Late Details */}
                    {Object.entries(lateDetails).map(([dept, employees]) => (
                        <div key={dept} className="mt-6">
                            <h3 className="mb-2 text-lg font-bold">Late - {dept}</h3>
                            <table id={`late-${dept}`} className="min-w-full border text-left text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-3 py-2">Employee ID</th>
                                        <th className="border px-3 py-2">Name</th>
                                        <th className="border px-3 py-2">Designation</th>
                                        <th className="border px-3 py-2">Entry Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp, idx) => (
                                        <tr key={idx}>
                                            <td className="border px-3 py-2">{emp.employee_id}</td>
                                            <td className="border px-3 py-2">{emp.name}</td>
                                            <td className="border px-3 py-2">{emp.designation}</td>
                                            <td className="border px-3 py-2">{emp.in_time}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}

                    {/* Absent Details */}
                    {Object.entries(absentDetails).map(([dept, employees]) => (
                        <div key={dept} className="mt-6">
                            <h3 className="mb-2 text-lg font-bold">Not Present - {dept}</h3>
                            <table id={`absent-${dept}`} className="min-w-full border text-left text-sm">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border px-3 py-2">Employee ID</th>
                                        <th className="border px-3 py-2">Name</th>
                                        <th className="border px-3 py-2">Designation</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {employees.map((emp, idx) => (
                                        <tr key={idx}>
                                            <td className="border px-3 py-2">{emp.employee_id}</td>
                                            <td className="border px-3 py-2">{emp.name}</td>
                                            <td className="border px-3 py-2">{emp.designation}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}

                    <footer className="mt-8 text-center text-xs text-gray-500">Powered By: ICT Wing & Archive, BAUST</footer>
                </div>
            </div>
        </AppLayout>
    );
}
