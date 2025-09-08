import { Head, router, useForm } from '@inertiajs/react';
import { LoaderCircle, Trash2 } from 'lucide-react';
import { FormEventHandler } from 'react';

import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { useState } from 'react';

import type { BreadcrumbItem } from '@/types';

const weekdaysList = [
    { code: "sun", label: "Sunday" },
    { code: "mon", label: "Monday" },
    { code: "tue", label: "Tuesday" },
    { code: "wed", label: "Wednesday" },
    { code: "thu", label: "Thursday" },
    { code: "fri", label: "Friday" },
    { code: "sat", label: "Saturday" },
];


const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Time Assignment', href: '/time-assignments' },
];

export default function Index({ users, assignments }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        employee_id: '',
        allowed_entry: '',
        allowed_exit: '',
        weekdays: [] as string[],
        loop: true,
    });

    const handleSubmit: FormEventHandler = (e) => {
        e.preventDefault();
        post('/time-assignments', { onSuccess: () => reset() });
    };

    const toggleWeekday = (day: string) => {
        if (data.weekdays.includes(day)) {
            setData("weekdays", data.weekdays.filter((d) => d !== day));
        } else {
            setData("weekdays", [...data.weekdays, day]);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Time Assignment" />

            <div className="grid md:grid-cols-2 gap-6 m-8">
                {/* Form Section */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Assign Time</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        {/* Employee Dropdown */}
                        <div className="grid gap-2">
                            <Label htmlFor="employee_id">Select Employee</Label>
                            <select
                                id="employee_id"
                                value={data.employee_id}
                                onChange={(e) => setData('employee_id', e.target.value)}
                                className="w-full rounded-md border px-3 py-2 text-sm"
                            >
                                <option value="">-- Select Employee --</option>
                                {users.map((u) => (
                                    <option key={u.employee_id} value={u.employee_id}>
                                        {u.name} ({u.employee_id})
                                    </option>
                                ))}
                            </select>
                            <InputError message={errors.employee_id} />
                        </div>

                        {/* Allowed Entry */}
                        <div className="grid gap-2">
                            <Label htmlFor="allowed_entry">Allowed Entry</Label>
                            <Input
                                id="allowed_entry"
                                type="time"
                                value={data.allowed_entry}
                                onChange={(e) => setData('allowed_entry', e.target.value)}
                            />
                            <InputError message={errors.allowed_entry} />
                        </div>

                        {/* Allowed Exit */}
                        <div className="grid gap-2">
                            <Label htmlFor="allowed_exit">Allowed Exit</Label>
                            <Input
                                id="allowed_exit"
                                type="time"
                                value={data.allowed_exit}
                                onChange={(e) => setData('allowed_exit', e.target.value)}
                            />
                            <InputError message={errors.allowed_exit} />
                        </div>

                        {/* Weekday Checkboxes */}
                        <div className="grid gap-2">
                            <Label>Allowed Weekdays</Label>
                            <div className="flex flex-wrap gap-3">
                                {weekdaysList.map((day) => (
                                    <label key={day.code} className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={data.weekdays.includes(day.code)}
                                            onChange={() =>
                                                setData(
                                                    "weekdays",
                                                    data.weekdays.includes(day.code)
                                                        ? data.weekdays.filter((d) => d !== day.code)
                                                        : [...data.weekdays, day.code]
                                                )
                                            }
                                        />
                                        {day.label}
                                    </label>
                                ))}

                            </div>
                            <InputError message={errors.weekdays} />
                        </div>

                        {/* Repeat Weekly */}
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="loop"
                                checked={data.loop}
                                onChange={(e) => setData("loop", e.target.checked)}
                            />
                            <Label htmlFor="loop">Repeat Every Week</Label>
                        </div>

                        <Button type="submit" className="w-full" disabled={processing}>
                            {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                            Save
                        </Button>
                    </form>
                </div>

                {/* Assigned List */}
                <div className="rounded-2xl border bg-card p-6 shadow-sm">
                    <h2 className="mb-4 text-lg font-semibold">Assigned Times</h2>
                    <table className="w-full text-sm border-collapse border">
                        <thead>
                        <tr className="text-left">
                            <th className="py-2 border-r">Name</th>
                            <th className="py-2 border-r">Entry</th>
                            <th className="py-2 border-r">Exit</th>
                            <th className="py-2 border-r">Days</th>
                            <th className="py-2 border-r">Repeat</th>
                            <th className="py-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {assignments.map((a) => (
                            <tr key={a.id} className="border-t">
                                <td className="py-2 border-r">{a.user.name}</td>
                                <td className="py-2 border-r">{a.allowed_entry}</td>
                                <td className="py-2 border-r">{a.allowed_exit}</td>
                                <td className="py-2 border-r">
                                    {Array.isArray(a.weekdays)
                                        ? a.weekdays
                                            .map((w) => weekdaysList.find((d) => d.code === w)?.label)
                                            .join(", ")
                                        : ""}
                                </td>
                                <td className="py-2 border-r">{a.repeat_weekly ? "Yes" : "No"}</td>
                                <td className="py-2">
                                    <form
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            router.delete(`/time-assignments/${a.id}`);
                                        }}
                                    >
                                        <Button type="submit" variant="ghost">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </form>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

            </div>
        </AppLayout>
    );
}
