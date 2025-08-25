import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek as dfnsStartOfWeek, getDay, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { router } from '@inertiajs/react';

type DayLog = {
    date: string;                // "YYYY-MM-DD"
    in_time: string | null;      // "HH:mm" or null
    out_time: string | null;     // "HH:mm" or null
    status: 'present' | 'absent' | 'holiday' | 'weekend' | 'future';
    label?: string | null;       // e.g., "Holiday" / "Weekend" / named holiday
};

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: (date: Date, _options: any) => dfnsStartOfWeek(date, { locale: enUS, weekStartsOn: 0 }), // Sun start
    getDay,
    locales,
});

// Build a local (non-UTC) Date from YYYY-MM-DD
function ymdToLocal(ymd: string) {
    const [y, m, d] = ymd.split('-').map(Number);
    return new Date(y, m - 1, d, 0, 0, 0, 0); // local midnight
}

// local YYYY-MM-DD (no UTC shift)
function toLocalYMD(date: Date) {
    const y = date.getFullYear();
    const m = `${date.getMonth() + 1}`.padStart(2, '0');
    const d = `${date.getDate()}`.padStart(2, '0');
    return `${y}-${m}-${d}`;
}

export default function AttendanceCalendar({ logs, month, year }: { logs: DayLog[]; month: number; year: number; }) {
    // sets for day background coloring
    const holidaySet = new Set(logs.filter(l => l.status === 'holiday').map(l => l.date));
    const weekendSet = new Set(logs.filter(l => l.status === 'weekend').map(l => l.date));

    // events (skip future blank days, avoid "In:")
    const events = logs
        .filter(l => l.status !== 'future') // no event bubble for future days
        .map(l => {
            const start = ymdToLocal(l.date);
            const end   = addDays(start, 1);

            let title = '';
            if (l.status === 'holiday') {
                title = l.label || 'Holiday';
                if (l.in_time) {
                    title += ` — In: ${l.in_time}` + (l.out_time ? ` | Out: ${l.out_time}` : '');
                }
            } else if (l.status === 'weekend') {
                title = l.label || 'Weekend';
                if (l.in_time) {
                    title += ` — In: ${l.in_time}` + (l.out_time ? ` | Out: ${l.out_time}` : '');
                }
            } else if (l.status === 'absent') {
                title = 'Absent';
            } else if (l.status === 'present') {
                title = `In: ${l.in_time ?? ''}` + (l.out_time ? ` | Out: ${l.out_time}` : '');
            }

            // avoid empty titles
            if (!title.trim()) title = l.label || ' ';

            return {
                title,
                start,
                end,       // IMPORTANT: end = start+1 day (exclusive), single-day all-day event
                allDay: true,
                resource: l, // keep original for styling
            };
        });

    // Cell backgrounds (avoid UTC toISOString)
    const dayPropGetter = (date: Date) => {
        const iso = toLocalYMD(date);
        if (holidaySet.has(iso)) {
            return { style: { backgroundColor: '#fdecea' } }; // light red
        }
        if (weekendSet.has(iso)) {
            return { style: { backgroundColor: '#f6f7f9' } }; // light gray
        }
        return {};
    };

    // Event chip styles by status
    const eventPropGetter = (event: any) => {
        const s = event.resource?.status as DayLog['status'];
        let style: React.CSSProperties = { borderRadius: 8, border: '1px solid rgba(0,0,0,0.05)' };
        if (s === 'absent') style.backgroundColor = '#f87171';       // red-ish
        else if (s === 'holiday' || s === 'weekend') style.backgroundColor = '#60a5fa'; // blue-ish
        else style.backgroundColor = '#3b82f6'; // present
        return { style };
    };

    // Reload month when user navigates
    const onNavigate = (date: Date) => {
        const m = date.getMonth() + 1;
        const y = date.getFullYear();
        router.visit(`/dashboard?month=${m}&year=${y}`, { preserveState: true, preserveScroll: true });
    };

    return (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow p-4 sm:p-6 overflow-x-auto">
            <h3 className="text-lg font-bold mb-4">Attendance Calendar</h3>
            <div className="min-h-[420px] md:h-[650px]">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    defaultView="month"
                    views={['month']}
                    dayPropGetter={dayPropGetter}
                    eventPropGetter={eventPropGetter}
                    style={{ width: '100%', height: '100%' }}
                    onNavigate={onNavigate}
                    toolbar
                    popup
                    longPressThreshold={250} // nicer on mobile
                />
            </div>
        </div>
    );
}
