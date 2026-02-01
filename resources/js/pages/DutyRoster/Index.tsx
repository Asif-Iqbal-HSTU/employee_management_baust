import AppLayout from '@/layouts/app-layout';
import { useForm, Head } from '@inertiajs/react';
import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, User, ClipboardList, Search, X, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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
    isAdmin: boolean;
}

export default function DutyRoster({ employees, rosters, isAdmin }: Props) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>([]);

    const { data, setData, post, processing, reset } = useForm({
        employee_ids: [] as string[],
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        reason: '',
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

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('duty.roster.store'), {
            onSuccess: () => {
                reset();
                setSelectedEmployees([]);
                toast.success('Duty roster saved successfully');
            },
        });
    };

    const breadcrumbs = [
        { title: 'Dashboard', href: '/dashboard' },
        { title: 'Duty Roster', href: '/duty-roster' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Duty Roster Management" />
            <div className="mx-auto max-w-7xl space-y-8 p-6">

                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                        Duty Roster Management
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400">
                        Schedule and manage duty rosters for department employees.
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Form Section */}
                    <Card className="lg:col-span-1 border-none shadow-xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <ClipboardList className="h-5 w-5 text-blue-600" />
                                Create Roster
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
                                            className="pl-10 h-10 border-slate-200 focus:ring-blue-500"
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
                                            <Badge key={emp.employee_id} variant="secondary" className="flex items-center gap-1.5 py-1.5 px-3 bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                                                <User className="h-3 w-3" />
                                                <span>{emp.name}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeEmployee(emp.employee_id)}
                                                    className="ml-1 rounded-full p-0.5 hover:bg-blue-200 dark:hover:bg-blue-800"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </Badge>
                                        ))}
                                        {selectedEmployees.length === 0 && (
                                            <p className="text-xs italic text-slate-400">No employees selected</p>
                                        )}
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <Calendar className="h-3.5 w-3.5" /> Start Date
                                        </Label>
                                        <Input
                                            type="date"
                                            required
                                            value={data.start_date}
                                            onChange={e => setData('start_date', e.target.value)}
                                            className="h-10 border-slate-200 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <Calendar className="h-3.5 w-3.5" /> End Date
                                        </Label>
                                        <Input
                                            type="date"
                                            required
                                            value={data.end_date}
                                            onChange={e => setData('end_date', e.target.value)}
                                            className="h-10 border-slate-200 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Time Range */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <Clock className="h-3.5 w-3.5" /> Start Time
                                        </Label>
                                        <Input
                                            type="time"
                                            required
                                            value={data.start_time}
                                            onChange={e => setData('start_time', e.target.value)}
                                            className="h-10 border-slate-200 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                                            <Clock className="h-3.5 w-3.5" /> End Time
                                        </Label>
                                        <Input
                                            type="time"
                                            required
                                            value={data.end_time}
                                            onChange={e => setData('end_time', e.target.value)}
                                            className="h-10 border-slate-200 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Reason */}
                                <div className="space-y-2">
                                    <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reason / Remarks</Label>
                                    <Input
                                        type="text"
                                        placeholder="Optional reason for rescheduling"
                                        value={data.reason}
                                        onChange={e => setData('reason', e.target.value)}
                                        className="h-10 border-slate-200 focus:ring-blue-500"
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={processing || selectedEmployees.length === 0}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-6 rounded-lg transition-all shadow-md active:scale-95"
                                >
                                    {processing ? 'Saving...' : 'Save Duty Roster'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* List Section */}
                    <Card className="lg:col-span-2 border-none shadow-xl">
                        <CardHeader className="border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                                Rostered Personnel
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
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <ClipboardList className="h-8 w-8 opacity-20" />
                                                        <p>No duty rosters found.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination (Simplified for now) */}
                            {rosters.last_page > 1 && (
                                <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                                    <p className="text-xs text-slate-500">Page {rosters.current_page} of {rosters.last_page}</p>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={rosters.current_page === 1}
                                            onClick={() => {
                                                const url = new URL(window.location.href);
                                                url.searchParams.set('page', (rosters.current_page - 1).toString());
                                                window.location.href = url.toString();
                                            }}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={rosters.current_page === rosters.last_page}
                                            onClick={() => {
                                                const url = new URL(window.location.href);
                                                url.searchParams.set('page', (rosters.current_page + 1).toString());
                                                window.location.href = url.toString();
                                            }}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
