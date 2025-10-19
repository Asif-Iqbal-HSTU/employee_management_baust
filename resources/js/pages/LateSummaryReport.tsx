import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useRef } from 'react';

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

    const handleDownload = () => {
        const doc = new jsPDF('p', 'pt', 'a4');

        doc.setFontSize(13);
        doc.text(`Late & Absent Employees Summary Report - ${date}`, 40, 40);
        doc.setFontSize(10);
        doc.text('(Employees entering after 08:00 AM are considered late.)', 40, 55);

        autoTable(doc, {
            html: tablesRef.current!.querySelector('#summary-table') as HTMLTableElement,
            startY: 70,
            styles: { fontSize: 8 },
            theme: 'grid',
        });

        let currentY = (doc as any).lastAutoTable.finalY + 30;

        Object.entries(lateDetails).forEach(([dept, employees]) => {
            doc.setFontSize(11);
            doc.text(`Late - ${dept}`, 40, currentY);
            currentY += 10;

            autoTable(doc, {
                html: tablesRef.current!.querySelector(`#late-${dept}`) as HTMLTableElement,
                startY: currentY,
                styles: { fontSize: 8 },
                theme: 'grid',
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
                styles: { fontSize: 8 },
                theme: 'grid',
            });

            currentY = (doc as any).lastAutoTable.finalY + 20;
        });

        doc.save(`Late_Absent_Summary_${date}.pdf`);
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
                    <button onClick={handleDownload} className="rounded bg-green-700 px-4 py-2 text-white hover:bg-green-800">
                        Download PDF
                    </button>
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

                    {/* Notices */}
                    <div className="mt-8 rounded border bg-gray-100 p-3 text-sm">
                        <p>
                            <i>
                                Some employees are assigned to late hours. They may appear as late/not-present if no data was recorded in the device
                                before report generation.
                            </i>
                        </p>
                    </div>

                    <div className="mt-3 rounded border bg-gray-100 p-3 text-sm">
                        <p>
                            <i>
                                The following persons have duplicate ID issues (data under review): Md. Mahadi Hasan (CSE), Md. Yah-Ya Ul Haque (EEE),
                                Sifat Hossain (EEE), Md. Mahmudul Hasan (ME), Md. Shahadat Hossain (DBA), Azra Sultana Sadia (EEE), and Md. Mominul
                                Hoque (Registrar Office).
                            </i>
                        </p>
                    </div>

                    <footer className="mt-8 text-center text-xs text-gray-500">Powered By: ICT Wing & Archive, BAUST</footer>
                </div>
            </div>
        </AppLayout>
    );
}
