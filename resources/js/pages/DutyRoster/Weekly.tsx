import AppLayout from '@/layouts/app-layout';
import { useForm, Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ClipboardList, Search, X, CheckCircle2, CalendarDays, Trash2, Info } from 'lucide-react';
import { toast } from 'sonner';
import { Checkbox } from '@/components/ui/checkbox';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface Employee {
    employee_id: string;
    name: string;
    department: string;
}

interface Roster {
    id: number;
    employee_id: string;
    date: string;
    start_time: string;
    end_time: string;
    reason: string | null;
    user?: {
        name: string;
    };
}

interface Props {
    employees: Employee[];
    rosters: {
        data: Roster[];
        links: any[];
        current_page: number;
        last_page: number;
    };
}

const WEEKDAYS = [
    { id: 'Saturday', label: 'Saturday' },
    { id: 'Sunday', label: 'Sunday' },
    { id: 'Monday', label: 'Monday' },
    { id: 'Tuesday', label: 'Tuesday' },
    { id: 'Wednesday', label: 'Wednesday' },
    { id: 'Thursday', label: 'Thursday' },
    { id: 'Friday', label: 'Friday' },
];

export default function WeeklyRoster({ employees, rosters }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

    const { data, setData, post, processing, reset, errors } = useForm({
        employee_ids: [] as string[],
        start_date: '',
        end_date: '',
        schedule: WEEKDAYS.map(day => ({
            day: day.id,
            active: false,
            start_time: '09:00',
            end_time: '17:00'
        }))
    });

    const filteredEmployees = employees.filter(emp =>
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id.includes(searchTerm)
    ).filter(emp => !selectedEmployees.some(selected => selected.employee_id === emp.employee_id));

    const addEmployee = (emp: Employee) => {
        const newSelected = [...selectedEmployees, emp];
        setSelectedEmployees(newSelected);
        setData('employee_ids', newSelected.map(e => e.employee_id));
        setSearchTerm('');
    };

    const removeEmployee = (empId: string) => {
        const newSelected = selectedEmployees.filter(e => e.employee_id !== empId);
        setSelectedEmployees(newSelected);
        setData('employee_ids', newSelected.map(e => e.employee_id));
    };

    const handleScheduleChange = (index: number, field: string, value: any) => {
        const newSchedule = [...data.schedule];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setData('schedule', newSchedule);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // Validation: At least one day selected
        if (!data.schedule.some(d => d.active)) {
            toast.error('Please select at least one day in the schedule.');
            return;
        }

        post(route('duty.roster.weekly.store'), {
            onSuccess: () => {
                reset();
                setSelectedEmployees([]);
                toast.success('Weekly duty roster saved successfully');
            },
            onError: (err) => {
                console.error(err);
                toast.error('Failed to save roster. Please check inputs.');
            }
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Duty Roster', href: '/duty-roster' },
        { title: 'Weekly Roster', href: '/duty-roster/weekly' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Weekly Duty Roster" />
            <div className="mx-auto max-w-7xl space-y-8 p-6">

                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                        Weekly Duty Roster
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Set overlapping weekly schedules for employees over a specific period.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Form Section */}
                    <Card className="lg:col-span-1 border-none shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <CalendarDays className="h-5 w-5 text-indigo-600" />
                                Configure Schedule
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={submit} className="space-y-6">
                                {/* Employee Selector */}
                                <div className="space-y-3">
                                    <Label className="text-sm font-semibold uppercase tracking-wider text-slate-500">Select Employees</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                        <Input
                                            type="text"
                                            placeholder="Search by name or ID..."
                                            className="pl-10 h-10 border-slate-200 focus:ring-indigo-500"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                        />
                                        {searchTerm && (
                                            <div className="absolute z-10 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg dark:border-slate-800 dark:bg-slate-900 transition-all duration-200">
                                                {filteredEmployees.length > 0 ? (
                                                    filteredEmployees.map(emp => (
                                                        <button
                                                            key={emp.employee_id}
                                                            type="button"
                                                            onClick={() => addEmployee(emp)}
                                                            className="flex w-full items-center justify-between gap-2 rounded-sm px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                        >
                                                            <div className="flex flex-col items-start">
                                                                <span className="font-medium">{emp.name}</span>
                                                                <span className="text-xs text-slate-500">{emp.employee_id} - {emp.department}</span>
                                                            </div>
                                                            <Badge variant="outline" className="text-[10px]">Add</Badge>
                                                        </button>
                                                    ))
                                                ) : (
                                                    <div className="px-3 py-2 text-sm text-slate-500">No employees found</div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Selected Employees Chips */}
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {selectedEmployees.map(emp => (
                                            <Badge key={emp.employee_id} variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800">
                                                <User className="h-3 w-3" />
                                                <span>{emp.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeEmployee(emp.employee_id)}
                                                    className="ml-1 rounded-full p-0.5 hover:bg-indigo-200 dark:hover:bg-indigo-800"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                        {selectedEmployees.length === 0 && (
                                            <p className="text-xs italic text-slate-400">No employees selected</p>
                                        )}
                                        {errors.employee_ids && <p className="text-red-500 text-xs w-full">{errors.employee_ids}</p>}
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <Calendar className="h-3.5 w-3.5" /> From Date
                                        </Label>
                                        <Input
                                            type="date"
                                            required
                                            value={data.start_date}
                                            onChange={e => setData('start_date', e.target.value)}
                                            className="h-10 border-slate-200 focus:ring-indigo-500"
                                        />
                                        {errors.start_date && <p className="text-red-500 text-xs">{errors.start_date}</p>}
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <Calendar className="h-3.5 w-3.5" /> Till Date
                                        </Label>
                                        <Input
                                            type="date"
                                            required
                                            value={data.end_date}
                                            onChange={e => setData('end_date', e.target.value)}
                                            className="h-10 border-slate-200 focus:ring-indigo-500"
                                        />
                                        {errors.end_date && <p className="text-red-500 text-xs">{errors.end_date}</p>}
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing || selectedEmployees.length === 0}
                                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-6 rounded-lg transition-all shadow-md active:scale-95"
                                >
                                    {processing ? 'Saving...' : 'Save Weekly Roster'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Weekly Schedule Section */}
                    <Card className="lg:col-span-2 border-none shadow-xl">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Clock className="h-5 w-5 text-indigo-600" />
                                Weekly Timing Configuration
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-slate-400 hover:text-indigo-600 transition-colors cursor-help" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>First active a day and select time</p>
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div className="grid grid-cols-12 gap-4 text-xs font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 pb-2 mb-2">
                                    <div className="col-span-3">Day</div>
                                    <div className="col-span-4">Start Time</div>
                                    <div className="col-span-4">End Time</div>
                                    <div className="col-span-1 text-center">Active</div>
                                </div>

                                {data.schedule.map((day, index) => (
                                    <div key={day.day} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg transition-all ${day.active ? 'bg-indigo-50 border border-indigo-100 dark:bg-indigo-900/20 dark:border-indigo-800' : 'opacity-60 hover:opacity-100'}`}>
                                        <div className="col-span-3 font-semibold text-slate-700 dark:text-slate-300">
                                            {day.day}
                                        </div>
                                        <div className="col-span-4">
                                            <Input
                                                type="time"
                                                value={day.start_time}
                                                onChange={(e) => handleScheduleChange(index, 'start_time', e.target.value)}
                                                disabled={!day.active}
                                                className="h-8 bg-white dark:bg-slate-900"
                                            />
                                        </div>
                                        <div className="col-span-4">
                                            <Input
                                                type="time"
                                                value={day.end_time}
                                                onChange={(e) => handleScheduleChange(index, 'end_time', e.target.value)}
                                                disabled={!day.active}
                                                className="h-8 bg-white dark:bg-slate-900"
                                            />
                                        </div>
                                        <div className="col-span-1 flex justify-center">
                                            <Checkbox
                                                checked={day.active}
                                                onCheckedChange={(checked) => handleScheduleChange(index, 'active', checked)}
                                                className="h-5 w-5 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Recently Rostered List */}
                <Card className="border-none shadow-xl">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                        <CardTitle className="flex items-center gap-2 text-lg">
                            <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                            Upcoming Rostered Personnel
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase text-[11px] font-bold">
                                    <tr>
                                        <th className="px-6 py-4">Employee</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Duty Hours</th>
                                        <th className="px-6 py-4">Reason</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {rosters.data.length > 0 ? rosters.data.map((roster) => (
                                        <tr key={roster.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-slate-900 dark:text-slate-100">{roster.user?.name}</span>
                                                    <span className="text-xs text-slate-500">{roster.employee_id}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                    <span>{new Date(roster.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant="outline" className="font-mono bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300">
                                                    {roster.start_time} - {roster.end_time}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4 max-w-xs truncate text-slate-500 italic">
                                                {roster.reason || '—'}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this roster entry?')) {
                                                            router.delete(route('duty.roster.destroy', roster.id), {
                                                                preserveScroll: true,
                                                                onSuccess: () => toast.success('Roster deleted'),
                                                            });
                                                        }
                                                    }}
                                                    className="text-slate-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                                                    title="Remove Roster"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                                <div className="flex flex-col items-center gap-2">
                                                    <ClipboardList className="h-8 w-8 opacity-20" />
                                                    <p>No upcoming rosters found.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
