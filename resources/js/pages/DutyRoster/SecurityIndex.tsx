import AppLayout from '@/layouts/app-layout';
import { useForm, Head, router } from '@inertiajs/react';
import { format, addDays, startOfWeek, parseISO } from 'date-fns';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Guard {
    employee_id: string;
    name: string;
}

interface RosterEntry {
    employee_id: string;
    date: string;
    start_time: string;
    end_time: string;
}

interface Props {
    guards: Guard[];
    existingRosters: RosterEntry[];
    currentWeekStart: string;
    isFinalized: boolean;
    isAdmin: boolean;
}

export default function SecurityIndex({ guards, existingRosters, currentWeekStart, isFinalized, isAdmin }: Props) {
    const [weekStart, setWeekStart] = useState(currentWeekStart);
    const [dates, setDates] = useState<Date[]>([]);

    useEffect(() => {
        const start = parseISO(weekStart);
        const newDates = Array.from({ length: 7 }, (_, i) => addDays(start, i));
        setDates(newDates);

        // Reload data for the new week if it changed
        if (weekStart !== currentWeekStart) {
            router.get(route('duty.roster.security'), { week_start: weekStart }, { preserveState: true });
        }
    }, [weekStart]);

    // Initialize entries from existingRosters
    const { data, setData, post, processing } = useForm({
        entries: (existingRosters || []).map(r => ({
            employee_id: r.employee_id,
            date: r.date,
            start_time: r.start_time.substring(0, 5), // Ensure HH:mm format
            end_time: r.end_time.substring(0, 5),     // Ensure HH:mm format
        })),
    });

    // Update form when currentWeekStart or existingRosters change (e.g. after navigation)
    useEffect(() => {
        setData('entries', (existingRosters || []).map(r => ({
            employee_id: r.employee_id,
            date: r.date,
            start_time: r.start_time.substring(0, 5),
            end_time: r.end_time.substring(0, 5),
        })));
    }, [existingRosters]);

    const handleTimeChange = (employeeId: string, date: string, field: 'start_time' | 'end_time', value: string) => {
        const existingIndex = data.entries.findIndex(e => e.employee_id === employeeId && e.date === date);
        const newEntries = [...data.entries];

        if (existingIndex > -1) {
            newEntries[existingIndex] = { ...newEntries[existingIndex], [field]: value };
        } else {
            // Initialize with default if not present
            newEntries.push({
                employee_id: employeeId,
                date: date,
                start_time: field === 'start_time' ? value : '07:00',
                end_time: field === 'end_time' ? value : '14:00',
            });
        }
        setData('entries', newEntries);
    };

    const getTimeValue = (employeeId: string, date: string, field: 'start_time' | 'end_time') => {
        const entry = data.entries.find(e => e.employee_id === employeeId && e.date === date);
        return entry ? entry[field] : '';
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('duty.roster.security.store'), {
            onSuccess: () => toast.success('Weekly roster saved successfully'),
        });
    };

    const isToday = (date: Date) => {
        return format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
    };

    return (
        <AppLayout>
            <Head title="Security Duty Roster" />
            <div className="p-4 sm:p-6 lg:p-8">
                <Card className="mx-auto max-w-7xl shadow-lg border-t-4 border-t-primary">
                    <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 pb-6 border-b mb-6">
                        <div>
                            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100 italic">Security Duty Roster</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1 font-medium italic">Weekly bulk entry table for security personnel</p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
                            <label className="text-sm font-semibold text-gray-600 dark:text-gray-400">Week Starting From:</label>
                            <Input
                                type="date"
                                value={weekStart}
                                onChange={(e) => setWeekStart(e.target.value)}
                                className="w-full sm:w-44 border-2 focus-visible:ring-primary h-10"
                            />
                            {isAdmin && (
                                <Button
                                    variant={isFinalized ? "destructive" : "default"}
                                    onClick={() => router.post(route('duty.roster.security.finalize'), {
                                        week_start: weekStart,
                                        finalize: !isFinalized
                                    }, {
                                        preserveScroll: true,
                                        onSuccess: () => toast.success(isFinalized ? 'Roster un-finalized' : 'Roster finalized')
                                    })}
                                    className="h-10 px-6 font-bold"
                                >
                                    {isFinalized ? 'Unlock Roster' : 'Finalize Roster'}
                                </Button>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 sm:p-6">
                        <form onSubmit={submit} className="space-y-6">
                            <div className="relative overflow-x-auto rounded-xl border shadow-sm scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
                                <table className="w-full border-collapse text-sm min-w-[800px]">
                                    <thead>
                                        <tr className="bg-gray-50/80 dark:bg-gray-900/50 backdrop-blur-sm sticky top-0 z-20">
                                            <th rowSpan={2} className="sticky left-0 z-50 border-r border-b p-4 text-left font-bold bg-gray-100 dark:bg-gray-800 text-primary min-w-[160px] shadow-[2px_0_5px_rgba(0,0,0,0.05)]">
                                                Security Person
                                            </th>
                                            {dates.map((date) => {
                                                const today = isToday(date);
                                                return (
                                                    <th
                                                        key={date.toISOString()}
                                                        colSpan={2}
                                                        className={cn(
                                                            "border p-3 text-center transition-colors duration-200",
                                                            today ? "bg-primary/10 border-primary/30" : "bg-gray-50/50 dark:bg-gray-900/30"
                                                        )}
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            <span className={cn("text-xs font-bold uppercase tracking-wider", today ? "text-primary" : "text-gray-500")}>
                                                                {format(date, 'EEEE')}
                                                            </span>
                                                            <span className={cn("text-sm font-black", today ? "text-primary scale-110" : "text-gray-800 dark:text-gray-200")}>
                                                                {format(date, 'dd-MM-yyyy')}
                                                            </span>
                                                            {today && <span className="text-[10px] mt-0.5 px-2 py-0.5 bg-primary text-white rounded-full font-bold animate-pulse">TODAY</span>}
                                                        </div>
                                                    </th>
                                                );
                                            })}
                                        </tr>
                                        <tr className="bg-gray-50/30 dark:bg-gray-900/20 sticky top-[72px] z-20">
                                            {dates.map((date) => (
                                                <Fragment key={date.toISOString() + '-sub'}>
                                                    <th className={cn("border p-2 text-center text-[10px] font-bold uppercase text-gray-500 w-24", isToday(date) && "bg-primary/5")}>In</th>
                                                    <th className={cn("border p-2 text-center text-[10px] font-bold uppercase text-gray-500 w-24", isToday(date) && "bg-primary/5")}>Out</th>
                                                </Fragment>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {guards.map((guard, idx) => (
                                            <tr key={guard.employee_id} className={cn(
                                                "group transition-colors duration-200 hover:bg-gray-50/50 dark:hover:bg-gray-800/30",
                                                idx % 2 === 0 ? "bg-white dark:bg-transparent" : "bg-gray-50/20 dark:bg-gray-800/10"
                                            )}>
                                                <td className="sticky left-0 z-10 border-r p-4 font-bold bg-white dark:bg-gray-900 shadow-[2px_0_5px_rgba(0,0,0,0.05)] group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-colors">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-bold shrink-0">
                                                            {guard.name.charAt(0)}
                                                        </div>
                                                        <span className="truncate max-w-[120px] inline-block">{guard.name}</span>
                                                    </div>
                                                </td>
                                                {dates.map((date) => {
                                                    const dateStr = format(date, 'yyyy-MM-dd');
                                                    const today = isToday(date);
                                                    const startTime = getTimeValue(guard.employee_id, dateStr, 'start_time');
                                                    const endTime = getTimeValue(guard.employee_id, dateStr, 'end_time');
                                                    const isOvernightShift = startTime && endTime && (endTime < startTime);

                                                    return (
                                                        <Fragment key={guard.employee_id + dateStr}>
                                                            <td className={cn("border p-2 transition-all group-hover:bg-opacity-50", today && "bg-primary/5")}>
                                                                <input
                                                                    type="time"
                                                                    className="w-full bg-white dark:bg-gray-800/50 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary p-2 text-center font-medium transition-all hover:border-gray-400 text-sm h-10 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                    value={startTime}
                                                                    onChange={(e) => handleTimeChange(guard.employee_id, dateStr, 'start_time', e.target.value)}
                                                                    disabled={!isAdmin && isFinalized}
                                                                />
                                                            </td>
                                                            <td className={cn("border p-2 transition-all group-hover:bg-opacity-50 relative", today && "bg-primary/5")}>
                                                                <input
                                                                    type="time"
                                                                    className={cn(
                                                                        "w-full bg-white dark:bg-gray-800/50 border rounded-md focus:ring-2 focus:ring-primary/50 focus:border-primary p-2 text-center font-medium transition-all hover:border-gray-400 text-sm h-10 disabled:opacity-50 disabled:cursor-not-allowed",
                                                                        isOvernightShift && "border-amber-400 dark:border-amber-600 ring-1 ring-amber-100 dark:ring-amber-900/30"
                                                                    )}
                                                                    value={endTime}
                                                                    onChange={(e) => handleTimeChange(guard.employee_id, dateStr, 'end_time', e.target.value)}
                                                                    disabled={!isAdmin && isFinalized}
                                                                />
                                                                {isOvernightShift && (
                                                                    <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[8px] px-1 rounded font-bold shadow-sm z-10 animate-in fade-in zoom-in duration-300">
                                                                        +1d
                                                                    </span>
                                                                )}
                                                            </td>
                                                        </Fragment>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
                                <p className="text-xs text-muted-foreground italic font-medium">
                                    Total entries currently in grid: <span className="text-primary font-bold">{data.entries.length}</span>
                                </p>
                                <Button
                                    type="submit"
                                    disabled={processing || data.entries.length === 0 || (!isAdmin && isFinalized)}
                                    className="w-full sm:w-auto px-10 h-12 text-base font-bold shadow-lg hover:shadow-primary/20 transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <span className="flex items-center gap-2">
                                            <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                            Saving Changes...
                                        </span>
                                    ) : 'Save Weekly Roster'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}

// Utility for class merging
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}

// Helper to avoid issues with React Fragment inside loops if not imported
function Fragment({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
