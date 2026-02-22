import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, Save, User, Calendar as CalendarIcon, Clock, AlertCircle, CheckCircle2, XCircle, CheckCircle } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Manual Attendance', href: '/manual-attendance' },
];

export default function ManualEntry() {
    const [searchQuery, setSearchQuery] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [searching, setSearching] = useState(false);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        in_time: '',
        out_time: '',
        status: '',
        remarks: '',
    });

    const [userDetails, setUserDetails] = useState<{ name: string, employee_id: string } | null>(null);
    const [multipleUsers, setMultipleUsers] = useState<{ name: string, employee_id: string }[] | null>(null);
    const [existingEntry, setExistingEntry] = useState(false);
    const [initialStatus, setInitialStatus] = useState('');

    // Modal State
    const [modal, setModal] = useState<{
        open: boolean;
        type: 'success' | 'error';
        title: string;
        message: string;
    }>({
        open: false,
        type: 'success',
        title: '',
        message: ''
    });

    const handleSearch = async (e?: React.FormEvent, selectedId?: string) => {
        if (e) e.preventDefault();

        const q = selectedId || searchQuery;
        if (!q || !date) {
            toast.error('Please enter Employee ID/Name and Date');
            return;
        }

        setSearching(true);
        setUserDetails(null);
        setMultipleUsers(null);
        setExistingEntry(false);
        setFormData({ in_time: '', out_time: '', status: '', remarks: '' });

        try {
            const response = await axios.get(route('attendance.manual.search'), {
                params: { query: q, date: date }
            });

            if (response.data.multiple) {
                setMultipleUsers(response.data.users);
                toast.info('Multiple employees found. Please select one.');
            } else {
                setUserDetails(response.data.user);

                if (response.data.attendance) {
                    setExistingEntry(true);
                    const initial = response.data.attendance.status || '';
                    setInitialStatus(initial);
                    setFormData({
                        in_time: response.data.attendance.in_time || '',
                        out_time: response.data.attendance.out_time || '',
                        status: initial,
                        remarks: response.data.attendance.remarks || '',
                    });
                    toast.info('Existing entry found.');
                } else {
                    setExistingEntry(false);
                    setInitialStatus('');
                    toast.success('Ready for new entry.');
                }
            }
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
                toast.error('Employee not found');
            } else {
                toast.error('Failed to search attendance');
            }
        } finally {
            setSearching(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!userDetails?.employee_id || !date) return;

        setSaving(true);
        try {
            const response = await axios.post(route('attendance.manual.store'), {
                employee_id: userDetails.employee_id,
                date: date,
                ...formData
            });

            setExistingEntry(true);
            setModal({
                open: true,
                type: 'success',
                title: 'Operation Successful',
                message: response.data.message || 'Attendance record has been saved successfully to both daily attendance and device logs.'
            });
        } catch (error: any) {
            setModal({
                open: true,
                type: 'error',
                title: 'Operation Failed',
                message: error.response?.data?.error || 'An error occurred while saving the attendance record. Please try again or contact IT support.'
            });
        } finally {
            setSaving(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manual Attendance" />

            <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
                <div className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight">Manual Attendance Entry</h1>
                    <p className="text-muted-foreground">Search and manage employee attendance logs manually.</p>
                </div>

                {/* Search Card */}
                <Card className="shadow-lg border-primary/10">
                    <CardHeader className="bg-primary/5 rounded-t-lg">
                        <CardTitle className="flex items-center gap-2">
                            <Search className="w-5 h-5" />
                            Quick Search
                        </CardTitle>
                        <CardDescription>Enter Employee ID or Name and Date</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <form onSubmit={(e) => handleSearch(e)} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            <div className="space-y-2">
                                <Label htmlFor="query">Employee ID or Name</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="query"
                                        placeholder="Search ID or Name..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="date">Attendance Date</Label>
                                <div className="relative">
                                    <CalendarIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="date"
                                        type="date"
                                        className="pl-9"
                                        value={date}
                                        onChange={(e) => setDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={searching} className="w-full">
                                {searching ? 'Searching...' : (
                                    <>
                                        <Search className="mr-2 h-4 w-4" /> Search
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Multiple Users Selection */}
                {multipleUsers && (
                    <Card className="shadow-md border-orange-200 animate-in fade-in zoom-in duration-300">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Select Employee</CardTitle>
                            <CardDescription>Multiple matches found for "{searchQuery}"</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {multipleUsers.map((user) => (
                                    <button
                                        key={user.employee_id}
                                        onClick={() => handleSearch(undefined, user.employee_id)}
                                        className="flex items-center justify-between p-3 rounded-lg border hover:bg-orange-50 hover:border-orange-300 transition-all text-left group"
                                    >
                                        <div>
                                            <div className="font-semibold group-hover:text-orange-700">{user.name}</div>
                                            <div className="text-xs text-muted-foreground">ID: {user.employee_id}</div>
                                        </div>
                                        <CheckCircle2 className="w-5 h-5 text-orange-200 group-hover:text-orange-500" />
                                    </button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Result/Form Section */}
                {userDetails && (
                    <Card className="shadow-xl border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-2xl font-bold">{userDetails.name}</CardTitle>
                                <CardDescription className="text-sm font-medium text-primary">
                                    Employee ID: {userDetails.employee_id} | Date: {date}
                                </CardDescription>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${existingEntry ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30'}`}>
                                {existingEntry ? 'Existing Record' : 'New Entry'}
                            </div>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handleSave} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="in_time" className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-emerald-500" /> Check In Time
                                        </Label>
                                        <Input
                                            id="in_time"
                                            type="time"
                                            step="1"
                                            value={formData.in_time}
                                            onChange={(e) => {
                                                const newVal = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    in_time: newVal,
                                                    status: prev.status === initialStatus ? '' : prev.status
                                                }));
                                            }}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="out_time" className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-rose-500" /> Check Out Time
                                        </Label>
                                        <Input
                                            id="out_time"
                                            type="time"
                                            step="1"
                                            value={formData.out_time}
                                            onChange={(e) => {
                                                const newVal = e.target.value;
                                                setFormData(prev => ({
                                                    ...prev,
                                                    out_time: newVal,
                                                    status: prev.status === initialStatus ? '' : prev.status
                                                }));
                                            }}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="status">Override Status (Optional)</Label>
                                    <Input
                                        id="status"
                                        placeholder="e.g. ok, late entry, early leave"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    />
                                    <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                                        <AlertCircle className="w-3 h-3" /> Leave empty to auto-calculate based on office rules.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="remarks">Remarks</Label>
                                    <Input
                                        id="remarks"
                                        placeholder="Reason for manual entry..."
                                        value={formData.remarks}
                                        onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                                    />
                                </div>

                                <div className="pt-4 flex gap-4">
                                    <Button type="submit" disabled={saving} className="flex-1 bg-primary hover:bg-primary/90">
                                        {saving ? 'Saving...' : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" /> {existingEntry ? 'Update Entry' : 'Save Entry'}
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setUserDetails(null)}
                                        className="px-8"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Empty State */}
                {!userDetails && !searching && (
                    <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-xl bg-gray-50/50 dark:bg-gray-900/10">
                        <div className="bg-white dark:bg-gray-800 p-4 rounded-full shadow-md mb-4">
                            <User className="w-8 h-8 text-primary/40" />
                        </div>
                        <h3 className="text-lg font-medium">No results to show</h3>
                        <p className="text-muted-foreground text-center max-w-xs">
                            Search for an employee ID to start managing their attendance records manually.
                        </p>
                    </div>
                )}
            </div>

            {/* Success/Error Modal */}
            <Dialog open={modal.open} onOpenChange={(open) => setModal({ ...modal, open })}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader className="flex flex-col items-center justify-center pt-4">
                        <div className={`mb-4 rounded-full p-3 ${modal.type === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                            {modal.type === 'success' ? (
                                <CheckCircle className="h-10 w-10" />
                            ) : (
                                <XCircle className="h-10 w-10" />
                            )}
                        </div>
                        <DialogTitle className="text-xl font-bold text-center">{modal.title}</DialogTitle>
                        <DialogDescription className="text-center pt-2">
                            {modal.message}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center pt-4">
                        <Button
                            type="button"
                            variant={modal.type === 'success' ? 'default' : 'destructive'}
                            onClick={() => setModal({ ...modal, open: false })}
                            className="px-8"
                        >
                            {modal.type === 'success' ? 'Great!' : 'Understood'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
