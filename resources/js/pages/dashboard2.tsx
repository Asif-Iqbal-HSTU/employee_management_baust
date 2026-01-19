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
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
                {/* SUMMARY BOXES */}
                <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
                    {/* Absent */}
                    <div className="flex items-center rounded-lg bg-white dark:bg-gray-800 p-4 shadow">
                        <UserX className="mr-3 h-8 w-8 text-red-600 dark:text-red-500" />
                        <div>
                            <div className="text-xl font-bold dark:text-white">{summary.absence}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Absent Days</div>
                        </div>
                    </div>

                    {/* Late Entry */}
                    <div className="flex items-center rounded-lg bg-white dark:bg-gray-800 p-4 shadow">
                        <Clock className="mr-3 h-8 w-8 text-orange-600 dark:text-orange-500" />
                        <div>
                            <div className="text-xl font-bold dark:text-white">{summary.late}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Late Entries</div>
                        </div>
                    </div>

                    {/* Early Leave */}
                    <div className="flex items-center rounded-lg bg-white dark:bg-gray-800 p-4 shadow">
                        <Timer className="mr-3 h-8 w-8 text-purple-600 dark:text-purple-500" />
                        <div>
                            <div className="text-xl font-bold dark:text-white">{summary.early}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">Early Leaves</div>
                        </div>
                    </div>
                </div>

                {/* MONTH HEADER */}
                <div className="mb-4 flex items-center justify-between">
                    <button onClick={goToPrevMonth} className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <ChevronLeft className="h-6 w-6 dark:text-white" />
                    </button>

                    <h2 className="text-2xl font-bold dark:text-white">{firstDay.format('MMMM YYYY')}</h2>

                    <button onClick={goToNextMonth} className="rounded p-2 hover:bg-gray-200 dark:hover:bg-gray-700">
                        <ChevronRight className="h-6 w-6 dark:text-white" />
                    </button>
                </div>

                {/* COLOR LEGEND */}
                <div className="mb-4 flex flex-wrap gap-4">
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-blue-100 dark:bg-blue-900/40 border border-blue-500"></div>
                        <span className="text-xs text-blue-800 dark:text-blue-300">Holiday</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-yellow-100 dark:bg-yellow-900/40 border border-yellow-500"></div>
                        <span className="text-xs text-yellow-800 dark:text-yellow-300">Weekend</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-green-50 dark:bg-green-900/30 border border-green-400"></div>
                        <span className="text-xs text-green-800 dark:text-green-300">Present</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-400"></div>
                        <span className="text-xs text-yellow-800 dark:text-yellow-300">Late Entry</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-orange-50 dark:bg-orange-900/30 border border-orange-400"></div>
                        <span className="text-xs text-orange-800 dark:text-orange-300">Early Leave</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-red-50 dark:bg-red-900/40 border border-red-400"></div>
                        <span className="text-xs text-red-700 dark:text-red-400">Absent</span>
                    </div>

                    {/* NEW LEGEND */}
                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-purple-100 dark:bg-purple-900/40 border border-purple-500"></div>
                        <span className="text-xs text-purple-800 dark:text-purple-300">Leave</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-green-100 dark:bg-green-900/40 border border-green-600"></div>
                        <span className="text-xs text-green-800 dark:text-green-300">Today</span>
                    </div>
                </div>



                {/* CALENDAR GRID */}
                <div className="grid grid-cols-7 gap-2 rounded-lg bg-white dark:bg-gray-800 p-4 shadow">
                    {/* Weekday headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                        <div key={day} className="text-center font-semibold text-gray-700 dark:text-gray-200">
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

                        let cellClasses = 'flex h-28 flex-col rounded-lg border p-2 text-sm dark:text-gray-100';

                        if (isToday) {
                            cellClasses += ' border-green-500 bg-green-100 dark:bg-green-900/40 dark:border-green-600';

                        } else if (isHoliday) {
                            cellClasses += ' border-blue-500 bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300';

                        } else if (isWeeklyHoliday) {
                            cellClasses += ' border-yellow-500 bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300';

                        } else if (isLeave) {
                            cellClasses += ' border-purple-500 bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300';

                        } else if (log) {
                            if (log.status.includes('late'))
                                cellClasses += ' border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30';
                            else if (log.status.includes('early'))
                                cellClasses += ' border-orange-400 bg-orange-50 dark:bg-orange-900/30';
                            else
                                cellClasses += ' border-green-400 bg-green-50 dark:bg-green-900/30';

                        } else if (dayjs(date).isBefore(today, 'day')) {
                            cellClasses += ' border-red-400 bg-red-50 dark:bg-red-900/40 text-red-700 dark:text-red-400';
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
                                    <div className="mt-auto text-xs text-gray-400 dark:text-gray-500">—</div>
                                )}
                            </div>
                        );
                    })}




                </div>
            </div>
        </AppLayout>
    );
}
