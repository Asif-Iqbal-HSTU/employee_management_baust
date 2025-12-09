import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import dayjs from 'dayjs';
import { ChevronLeft, ChevronRight, Clock, Timer, UserX } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Dashboard', href: '/dashboard' }];

interface DailyLog {
    id: number;
    employee_id: number;
    date: string;
    in_time: string | null;
    out_time: string | null;
    status: string;
    remarks: string | null;
}

export default function Dashboard() {
    const { calendarLogs, holidays2025, summary, month, year } = usePage().props as {
        calendarLogs: Record<string, DailyLog>;
        holidays2025: string[];
        summary: { late: number; early: number; absence: number };
        month: number;
        year: number;
    };

    console.log(calendarLogs);

    const firstDay = dayjs(`${year}-${month}-01`);
    const daysInMonth = firstDay.daysInMonth();
    const startWeekDay = firstDay.day(); // 0 = Sunday
    const today = dayjs().format('YYYY-MM-DD');

    // Build array for calendar grid
    const daysArray: (string | null)[] = [];

    for (let i = 0; i < startWeekDay; i++) {
        daysArray.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const date = dayjs(`${year}-${month}-${d}`).format('YYYY-MM-DD');
        daysArray.push(date);
    }

    // Navigation handlers
    const goToPrevMonth = () => {
        router.get('/dashboard', {
            month: firstDay.subtract(1, 'month').month() + 1,
            year: firstDay.subtract(1, 'month').year(),
        });
    };

    const goToNextMonth = () => {
        router.get('/dashboard', {
            month: firstDay.add(1, 'month').month() + 1,
            year: firstDay.add(1, 'month').year(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gray-100 p-6">
                {/* SUMMARY BOXES */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Absent */}
                    <div className="flex items-center rounded-lg bg-white p-4 shadow">
                        <UserX className="mr-3 h-8 w-8 text-red-600" />
                        <div>
                            <div className="text-xl font-bold">{summary.absence}</div>
                            <div className="text-sm text-gray-600">Absent Days</div>
                        </div>
                    </div>

                    {/* Late Entry */}
                    <div className="flex items-center rounded-lg bg-white p-4 shadow">
                        <Clock className="mr-3 h-8 w-8 text-orange-600" />
                        <div>
                            <div className="text-xl font-bold">{summary.late}</div>
                            <div className="text-sm text-gray-600">Late Entries</div>
                        </div>
                    </div>

                    {/* Early Leave */}
                    <div className="flex items-center rounded-lg bg-white p-4 shadow">
                        <Timer className="mr-3 h-8 w-8 text-purple-600" />
                        <div>
                            <div className="text-xl font-bold">{summary.early}</div>
                            <div className="text-sm text-gray-600">Early Leaves</div>
                        </div>
                    </div>
                </div>

                {/* MONTH HEADER */}
                <div className="mb-4 flex items-center justify-between">
                    <button onClick={goToPrevMonth} className="rounded p-2 hover:bg-gray-200">
                        <ChevronLeft className="h-6 w-6" />
                    </button>

                    <h2 className="text-2xl font-bold">{firstDay.format('MMMM YYYY')}</h2>

                    <button onClick={goToNextMonth} className="rounded p-2 hover:bg-gray-200">
                        <ChevronRight className="h-6 w-6" />
                    </button>
                </div>

                {/* COLOR LEGEND */}
                <div className="mb-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-blue-100 border border-blue-500"></div>
                        <span className="text-xs text-blue-800">Holiday</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-yellow-100 border border-yellow-500"></div>
                        <span className="text-xs text-yellow-800">Weekend</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-green-50 border border-green-400"></div>
                        <span className="text-xs text-green-800">Present</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-yellow-50 border border-yellow-400"></div>
                        <span className="text-xs text-yellow-800">Late Entry</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-orange-50 border border-orange-400"></div>
                        <span className="text-xs text-orange-800">Early Leave</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-red-50 border border-red-400"></div>
                        <span className="text-xs text-red-700">Absent</span>
                    </div>

                    {/* NEW LEGEND */}
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-purple-100 border border-purple-500"></div>
                        <span className="text-xs text-purple-800">Leave</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-green-100 border border-green-600"></div>
                        <span className="text-xs text-green-800">Today</span>
                    </div>
                </div>



                {/* CALENDAR GRID */}
                <div className="grid grid-cols-7 gap-2 rounded-lg bg-white p-4 shadow">
                    {/* Weekday headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center font-semibold text-gray-700">
                            {day}
                        </div>
                    ))}

                    {/* Calendar cells */}
                    {daysArray.map((date, idx) => {
                        if (!date) return <div key={idx} className="h-24"></div>;

                        const log = calendarLogs[date];
                        const isHoliday = date in holidays2025;
                        const holidayName = holidays2025[date];
                        const isToday = date === today;

                        const weekday = dayjs(date).day();
                        const isWeeklyHoliday = (weekday === 5 || weekday === 6);

                        // NEW: leave detection
                        const isLeave = log && (
                            log.status?.includes("Sent to Registrar") ||
                            log.status?.includes("On Leave")
                        );

                        let cellClasses = 'flex h-28 flex-col rounded-lg border p-2 text-sm';

                        if (isToday) {
                            cellClasses += ' border-green-600 bg-green-100';

                        } else if (isHoliday) {
                            cellClasses += ' border-blue-500 bg-blue-100 text-blue-800';

                        } else if (isWeeklyHoliday) {
                            cellClasses += ' border-yellow-500 bg-yellow-100 text-yellow-800';

                        } else if (isLeave) {
                            cellClasses += ' border-purple-500 bg-purple-100 text-purple-800';

                        } else if (log) {
                            if (log.status.includes('late'))
                                cellClasses += ' border-yellow-400 bg-yellow-50';
                            else if (log.status.includes('early'))
                                cellClasses += ' border-orange-400 bg-orange-50';
                            else
                                cellClasses += ' border-green-400 bg-green-50';

                        } else if (dayjs(date).isBefore(today, 'day')) {
                            cellClasses += ' border-red-400 bg-red-50 text-red-700';
                        }

                        return (
                            <div key={date} className={cellClasses}>
                                <div className="font-bold">{dayjs(date).date()}</div>

                                {/* Content Rendering */}
                                {isLeave ? (
                                    <div className="mt-auto text-xs font-semibold">
                                        {log.status}
                                    </div>
                                ) : log ? (
                                    <div className="mt-auto text-xs">
                                        <div>In: <span className="font-medium">{log.in_time || '-'}</span></div>
                                        <div>Out: <span className="font-medium">{log.out_time || '-'}</span></div>
                                    </div>
                                ) : isHoliday ? (
                                    <div className="mt-auto text-xs font-semibold">{holidayName}</div>
                                ) : isWeeklyHoliday ? (
                                    <div className="mt-auto text-xs font-semibold">Weekend</div>
                                ) : dayjs(date).isBefore(today, 'day') ? (
                                    <div className="mt-auto text-xs">Absent</div>
                                ) : (
                                    <div className="mt-auto text-xs text-gray-400">—</div>
                                )}
                            </div>
                        );
                    })}




                </div>
            </div>
        </AppLayout>
    );
}
