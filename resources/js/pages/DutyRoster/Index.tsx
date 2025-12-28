import AppLayout from '@/layouts/app-layout';
import { useForm } from '@inertiajs/react';

export default function DutyRoster() {

    const { data, setData, post, processing } = useForm({
        employee_ids: [] as string[],
        start_date: '',
        end_date: '',
        start_time: '',
        end_time: '',
        reason: '',
    });

    const submit = () => {
        post(route('duty.roster.store'));
    };

    return (
        <AppLayout>
            <div className="max-w-3xl space-y-4 p-6">

                <h1 className="text-xl font-bold">Duty Roster / Reschedule</h1>

                <input
                    type="text"
                    placeholder="Employee IDs (comma separated)"
                    className="w-full border p-2"
                    onChange={(e) =>
                        setData(
                            'employee_ids',
                            e.target.value.split(',').map(v => v.trim())
                        )
                    }
                />

                <div className="grid grid-cols-2 gap-3">
                    <input type="date" className="border p-2"
                           onChange={e => setData('start_date', e.target.value)} />
                    <input type="date" className="border p-2"
                           onChange={e => setData('end_date', e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <input type="time" className="border p-2"
                           onChange={e => setData('start_time', e.target.value)} />
                    <input type="time" className="border p-2"
                           onChange={e => setData('end_time', e.target.value)} />
                </div>

                <input
                    type="text"
                    placeholder="Reason (optional)"
                    className="w-full border p-2"
                    onChange={e => setData('reason', e.target.value)}
                />

                <button
                    disabled={processing}
                    onClick={submit}
                    className="rounded bg-blue-600 px-4 py-2 text-white"
                >
                    Save Roster
                </button>
            </div>
        </AppLayout>
    );
}
