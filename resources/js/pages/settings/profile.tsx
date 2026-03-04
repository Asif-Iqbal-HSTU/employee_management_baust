import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import {
    User,
    Briefcase,
    Building2,
    Calendar,
    CreditCard,
    MapPin,
    Phone,
    Users,
    GraduationCap,
    Shield,
    IdCard,
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

interface EmployeeDetail {
    id: number;
    employee_id: string;
    name_bangla: string | null;
    post: string | null;
    employment_type: string | null;
    gender: string | null;
    joining_date: string | null;
    date_of_birth: string | null;
    nid_no: string | null;
    mobile_no: string | null;
    parents_name: string | null;
    father_name: string | null;
    mother_name: string | null;
    address: string | null;
    district: string | null;
    employee_class: string | null;
    department_from_sheet: string | null;
}

interface Assignment {
    department: string | null;
    designation: string | null;
}

type ProfileForm = {
    name: string;
    email: string;
};

function InfoRow({
    icon: Icon,
    label,
    value,
    className = '',
}: {
    icon: any;
    label: string;
    value: string | null | undefined;
    className?: string;
}) {
    if (!value) return null;
    return (
        <div className={`flex items-start gap-3 py-3 ${className}`}>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50">
                <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-0.5 text-sm font-medium text-foreground whitespace-pre-line">{value}</p>
            </div>
        </div>
    );
}

function EmploymentBadge({ type }: { type: string | null }) {
    if (!type) return null;
    const colorMap: Record<string, string> = {
        Perm: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
        Contract:
            'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
        Deputation:
            'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
    };
    return (
        <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorMap[type] || 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'}`}
        >
            {type === 'Perm' ? 'Permanent' : type}
        </span>
    );
}

export default function Profile({
    mustVerifyEmail,
    status,
    employeeDetail,
    assignment,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    employeeDetail?: EmployeeDetail | null;
    assignment?: Assignment | null;
}) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                {/* ───── HR Information Card ───── */}
                {employeeDetail && (
                    <div className="space-y-6">
                        <HeadingSmall
                            title="Employee Information"
                            description="Details provided by the HR department. Contact HR for any corrections."
                        />

                        {/* Profile Header Card */}
                        <Card className="overflow-hidden border-0 shadow-lg">
                            {/* Gradient Banner */}
                            <div className="relative h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE4YzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02LTYgMi42ODYtNiA2IDIuNjg2IDYgNiA2em0wIDJjLTQuNDE4IDAtOC0zLjU4Mi04LThzMy41ODItOCA4LTggOCAzLjU4MiA4IDgtMy41ODIgOC04IDh6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
                            </div>

                            <CardContent className="-mt-12 relative">
                                <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
                                    {/* Avatar Circle */}
                                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl dark:border-gray-800">
                                        <span className="text-2xl font-bold text-white">
                                            {auth.user.name
                                                .split(' ')
                                                .map((n: string) => n[0])
                                                .join('')
                                                .substring(0, 2)
                                                .toUpperCase()}
                                        </span>
                                    </div>

                                    <div className="flex-1 pb-1">
                                        <h3 className="text-xl font-bold text-foreground">{auth.user.name}</h3>
                                        {employeeDetail.name_bangla && (
                                            <p className="text-sm text-muted-foreground mt-0.5">
                                                {employeeDetail.name_bangla}
                                            </p>
                                        )}
                                        <div className="mt-2 flex flex-wrap items-center gap-2">
                                            {employeeDetail.post && (
                                                <Badge variant="secondary" className="text-xs">
                                                    {employeeDetail.post}
                                                </Badge>
                                            )}
                                            <EmploymentBadge type={employeeDetail.employment_type} />
                                            {employeeDetail.employee_class && (
                                                <Badge variant="outline" className="text-xs">
                                                    {employeeDetail.employee_class}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Detail Cards Grid */}
                        <div className="grid gap-4 md:grid-cols-2">
                            {/* Work Information */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        <Briefcase className="h-4 w-4" />
                                        Work Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-0 divide-y divide-border">
                                    <InfoRow
                                        icon={IdCard}
                                        label="Employee ID"
                                        value={employeeDetail.employee_id}
                                    />
                                    <InfoRow
                                        icon={Briefcase}
                                        label="Designation"
                                        value={assignment?.designation || employeeDetail.post}
                                    />
                                    <InfoRow
                                        icon={Building2}
                                        label="Department"
                                        value={
                                            assignment?.department || employeeDetail.department_from_sheet
                                        }
                                    />
                                    <InfoRow
                                        icon={Calendar}
                                        label="Joining Date"
                                        value={employeeDetail.joining_date}
                                    />
                                    {employeeDetail.gender && (
                                        <InfoRow icon={User} label="Gender" value={employeeDetail.gender} />
                                    )}
                                </CardContent>
                            </Card>

                            {/* Personal Information */}
                            <Card>
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                        <Shield className="h-4 w-4" />
                                        Personal Information
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-0 divide-y divide-border">
                                    <InfoRow
                                        icon={Calendar}
                                        label="Date of Birth"
                                        value={employeeDetail.date_of_birth}
                                    />
                                    <InfoRow
                                        icon={CreditCard}
                                        label="NID No."
                                        value={employeeDetail.nid_no}
                                    />
                                    <InfoRow
                                        icon={Phone}
                                        label="Mobile No."
                                        value={employeeDetail.mobile_no}
                                    />
                                    <InfoRow
                                        icon={Users}
                                        label="Father's Name"
                                        value={employeeDetail.father_name}
                                    />
                                    <InfoRow
                                        icon={Users}
                                        label="Mother's Name"
                                        value={employeeDetail.mother_name}
                                    />
                                    <InfoRow icon={MapPin} label="Address" value={employeeDetail.address} />
                                    <InfoRow
                                        icon={MapPin}
                                        label="District"
                                        value={employeeDetail.district}
                                    />
                                </CardContent>
                            </Card>
                        </div>

                        <p className="text-xs text-muted-foreground italic">
                            ℹ️ The above information is read-only and maintained by the HR department. Please
                            contact HR if you notice any discrepancies.
                        </p>

                        <Separator />
                    </div>
                )}

                {/* ───── Existing Profile Form ───── */}
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {/*<DeleteUser />*/}
            </SettingsLayout>
        </AppLayout>
    );
}
