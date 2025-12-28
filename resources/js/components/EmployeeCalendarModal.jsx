import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function EmployeeCalendarModal({ employee, isOpen, onClose }) {
    const [month, setMonth] = useState(dayjs().month() + 1);
    const [year, setYear] = useState(dayjs().year());
    const [logs, setLogs] = useState({});
    const [holidays, setHolidays] = useState({});

    // Load data when modal opens
    useEffect(() => {
        if (isOpen && employee) {
            loadCalendar();
        }
    }, [employee, month, year, isOpen]);

    const loadCalendar = async () => {
        const url = route("employee.calendar", {
            employeeId: employee.employee_id,
            month,
            year,
        });

        const res = await axios.get(url);
        setLogs(res.data.calendarLogs);
        setHolidays(res.data.holidays2025);
    };

    if (!isOpen) return null;

    const firstDay = dayjs(`${year}-${month}-01`);
    const today = dayjs().format("YYYY-MM-DD");
    const daysInMonth = firstDay.daysInMonth();
    const startWeekDay = firstDay.day();

    const daysArray = [];
    for (let i = 0; i < startWeekDay; i++) daysArray.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        daysArray.push(dayjs(`${year}-${month}-${d}`).format("YYYY-MM-DD"));
    }

    const prevMonth = () => {
        const newDate = firstDay.subtract(1, "month");
        setMonth(newDate.month() + 1);
        setYear(newDate.year());
    };

    const nextMonth = () => {
        const newDate = firstDay.add(1, "month");
        setMonth(newDate.month() + 1);
        setYear(newDate.year());
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-4xl rounded-lg bg-white p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold">
                        {employee.name} — Attendance Calendar
                    </h2>
                    <button className="text-red-600 font-bold" onClick={onClose}>
                        Close ✖
                    </button>
                </div>

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

                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-purple-100 border border-purple-500"></div>
                        <span className="text-xs text-purple-800">Leave</span>
                    </div>

                    <div className="flex items-center gap-1">
                        <div className="h-4 w-4 rounded bg-green-100 border border-green-600"></div>
                        <span className="text-xs text-green-800">Today</span>
                    </div>
                </div>

                {/* Month Navigation */}
                <div className="flex justify-between mb-4">
                    <button onClick={prevMonth} className="p-2 hover:bg-gray-200 rounded">
                        <ChevronLeft />
                    </button>
                    <h3 className="text-lg font-semibold">{firstDay.format("MMMM YYYY")}</h3>
                    <button onClick={nextMonth} className="p-2 hover:bg-gray-200 rounded">
                        <ChevronRight />
                    </button>
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2 bg-gray-50 p-4 rounded-lg border">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                        <div key={d} className="text-center font-bold">{d}</div>
                    ))}

                    {daysArray.map((date, i) => {
                        if (!date) return <div key={i} className="h-24"></div>;

                        const entry = logs[date];
                        const isToday = date === today;
                        const weekday = dayjs(date).day();
                        const isWeekend = weekday === 5 || weekday === 6;
                        const isHoliday = holidays[date];

                        let classes = "h-18 p-2 rounded border text-xs flex flex-col";

                        if (isToday) classes += " bg-green-100 border-green-600";
                        else if (isHoliday) classes += " bg-blue-100 border-blue-600";
                        else if (isWeekend) classes += " bg-yellow-100 border-yellow-500";
                        else if (entry) {
                            if (entry.status.includes("late"))
                                classes += " bg-yellow-50 border-yellow-400";
                            else if (entry.status.includes("early"))
                                classes += " bg-orange-50 border-orange-400";
                            else if (entry.status.includes("On Leave"))
                                classes += " bg-purple-50 border-purple-400";
                            else classes += " bg-green-50 border-green-400";
                        } else classes += " bg-red-50 border-red-400";

                        return (
                            <div key={i} className={classes}>
                                <strong>{dayjs(date).date()}</strong>

                                {entry ? (
                                    <div className="mt-auto">
                                        In: <b>{entry.in_time || "-"}</b>
                                        <br />
                                        Out: <b>{entry.out_time || "-"}</b>
                                    </div>
                                ) : isHoliday ? (
                                    <div className="mt-auto">{isHoliday}</div>
                                ) : isWeekend ? (
                                    <div className="mt-auto">Weekend</div>
                                ) : dayjs(date).isBefore(today, 'day') ? (
                                    <div className="mt-auto text-xs">Absent</div>
                                ) : (
                                    <div className="mt-auto text-xs text-gray-400">—</div> // future dates
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
