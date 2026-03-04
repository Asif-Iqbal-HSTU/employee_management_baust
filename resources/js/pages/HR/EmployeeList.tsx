import React, { useState, useEffect } from 'react';
import { Head, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import SearchableSelect from '@/components/SearchableSelect';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, Users, Filter, ArrowRight } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    User,
    Briefcase,
    Building2,
    Calendar,
    MapPin,
    Phone,
    Contact,
    IdCard,
    ShieldCheck,
    Mail,
    UserCircle
} from 'lucide-react';

interface Props {
    employees: {
        data: any[];
        current_page: number;
        last_page: number;
        links: any[];
        total: number;
    };
    filters: {
        search?: string;
        department_id?: string;
        designation_id?: string;
        employment_type?: string;
    };
    departments: any[];
    designations: any[];
    employmentTypes: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'HR Management',
        href: '#',
    },
    {
        title: 'All Employees',
        href: '/hr/employees',
    },
];

export default function EmployeeList({ employees, filters, departments, designations, employmentTypes }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [departmentId, setDepartmentId] = useState(filters.department_id || '');
    const [designationId, setDesignationId] = useState(filters.designation_id || '');
    const [employmentType, setEmploymentType] = useState(filters.employment_type || '');

    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openDetails = (emp: any) => {
        setSelectedEmployee(emp);
        setIsModalOpen(true);
    };

    const handleSearch = () => {
        router.get('/hr/employees', {
            search,
            department_id: departmentId,
            designation_id: designationId,
            employment_type: employmentType,
        }, {
            preserveState: true,
            replace: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setDepartmentId('');
        setDesignationId('');
        setEmploymentType('');
        router.get('/hr/employees');
    };

    // Auto-search on select change
    useEffect(() => {
        if (departmentId !== (filters.department_id || '') ||
            designationId !== (filters.designation_id || '') ||
            employmentType !== (filters.employment_type || '')) {
            handleSearch();
        }
    }, [departmentId, designationId, employmentType]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Employee List - HR Management" />

            <div className="p-4 md:p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Employee Directory</h1>
                        <p className="text-muted-foreground">Manage and view all university employees.</p>
                    </div>
                    <div className="bg-primary/10 px-4 py-2 rounded-lg flex items-center gap-3 border border-primary/20">
                        <Users className="h-5 w-5 text-primary" />
                        <span className="font-semibold text-primary">{employees.total} Total Employees</span>
                    </div>
                </div>

                <Card className="border-0 shadow-md">
                    <CardHeader className="pb-3 border-b">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Keywords</label>
                                <div className="relative">
                                    <Input
                                        placeholder="Name or ID..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                        className="pr-10"
                                    />
                                    <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Department</label>
                                <SearchableSelect
                                    items={departments}
                                    value={departmentId}
                                    onChange={setDepartmentId}
                                    placeholder="All Departments"
                                    labelKey="dept_name"
                                    valueKey="id"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Designation</label>
                                <SearchableSelect
                                    items={designations}
                                    value={designationId}
                                    onChange={setDesignationId}
                                    placeholder="All Designations"
                                    labelKey="designation_name"
                                    valueKey="id"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Employment Type</label>
                                <SearchableSelect
                                    items={employmentTypes.map(t => ({ id: t, name: t }))}
                                    value={employmentType}
                                    onChange={setEmploymentType}
                                    placeholder="All Types"
                                    labelKey="name"
                                    valueKey="id"
                                />
                            </div>
                        </div>

                        <div className="mt-6 flex items-center justify-end gap-3">
                            <Button variant="outline" onClick={clearFilters} className="gap-2">
                                <X className="h-4 w-4" />
                                Clear Filters
                            </Button>
                            <Button onClick={handleSearch} className="gap-2">
                                <Search className="h-4 w-4" />
                                Search
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[120px] font-bold">ID</TableHead>
                                <TableHead className="font-bold">Full Name</TableHead>
                                <TableHead className="font-bold">Designation</TableHead>
                                <TableHead className="font-bold">Department</TableHead>
                                <TableHead className="font-bold">Type</TableHead>
                                <TableHead className="text-right font-bold w-[100px]">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {employees.data.length > 0 ? (
                                employees.data.map((emp) => (
                                    <TableRow key={emp.employee_id} className="hover:bg-muted/30 transition-colors">
                                        <TableCell className="font-mono text-sm font-medium">
                                            {emp.employee_id}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-semibold text-foreground">{emp.name}</span>
                                                <span className="text-xs text-muted-foreground">{emp.employee_detail?.name_bangla || ''}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal border-blue-200 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                                {emp.assignment?.designation?.designation_name || 'N/A'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{emp.assignment?.department?.dept_name || 'N/A'}</span>
                                        </TableCell>
                                        <TableCell>
                                            {emp.employee_detail?.employment_type && (
                                                <Badge variant="secondary" className="font-normal">
                                                    {emp.employee_detail.employment_type}
                                                </Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 hover:bg-primary/10 hover:text-primary"
                                                onClick={() => openDetails(emp)}
                                            >
                                                <ArrowRight className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                        No employees found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing page {employees.current_page} of {employees.last_page}
                    </div>
                    <div className="flex items-center gap-2">
                        {employees.links.map((link, i) => (
                            <Button
                                key={i}
                                variant={link.active ? 'default' : 'outline'}
                                size="sm"
                                disabled={!link.url}
                                onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                                className={!link.url ? 'opacity-50 cursor-not-allowed' : ''}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="max-w-full sm:max-w-7xl w-[95vw] lg:w-[90vw] max-h-[95vh] overflow-y-auto p-0 border-0 shadow-2xl">
                    <DialogHeader className="p-8 bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-950 text-white rounded-t-lg relative overflow-hidden">
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                            <div className="h-28 w-28 rounded-2xl bg-white/10 flex items-center justify-center border-2 border-white/20 backdrop-blur-md shadow-2xl">
                                <UserCircle className="h-20 w-20 text-white/90" />
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                                    <DialogTitle className="text-3xl font-extrabold tracking-tight leading-tight">{selectedEmployee?.name}</DialogTitle>
                                    {selectedEmployee?.employee_detail?.employment_type && (
                                        <Badge className="bg-blue-500 hover:bg-blue-600 text-white border-0 py-1.5 px-4 font-bold text-xs uppercase tracking-wider">
                                            {selectedEmployee.employee_detail.employment_type}
                                        </Badge>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-2 text-blue-100/80 font-medium">
                                    <div className="flex items-center gap-2.5">
                                        <IdCard className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm">Employee ID: <span className="text-white">{selectedEmployee?.employee_id}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Building2 className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm">Dept: <span className="text-white truncate max-w-[200px] inline-block align-bottom">{selectedEmployee?.assignment?.department?.dept_name || selectedEmployee?.employee_detail?.department_from_sheet}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2.5">
                                        <Briefcase className="h-4 w-4 text-blue-400" />
                                        <span className="text-sm">Post: <span className="text-white">{selectedEmployee?.assignment?.designation?.designation_name || selectedEmployee?.employee_detail?.post}</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-10 bg-slate-50/50">
                        {/* Column 1: Core Professional */}
                        <div className="space-y-8">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 bg-blue-600 rounded-full" />
                                    Employment Core
                                </h3>
                                <div className="space-y-3">
                                    <DetailItem label="Bangla Name" value={selectedEmployee?.employee_detail?.name_bangla} icon={User} />
                                    <DetailItem label="Pay Class" value={selectedEmployee?.employee_detail?.employee_class} icon={ShieldCheck} />
                                    <DetailItem label="Joining History" value={selectedEmployee?.employee_detail?.joining_date} icon={Calendar} isMultiline />
                                </div>
                            </div>
                        </div>

                        {/* Column 2: Personal & Contact */}
                        <div className="space-y-8">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 bg-indigo-600 rounded-full" />
                                    Personal Identity
                                </h3>
                                <div className="space-y-3">
                                    <DetailItem label="Date of Birth" value={selectedEmployee?.employee_detail?.date_of_birth} icon={Calendar} />
                                    <DetailItem label="NID Number" value={selectedEmployee?.employee_detail?.nid_no} icon={IdCard} />
                                    <DetailItem label="Gender Identity" value={selectedEmployee?.employee_detail?.gender} icon={User} />
                                    <DetailItem label="Home District" value={selectedEmployee?.employee_detail?.district} icon={MapPin} />
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 bg-emerald-600 rounded-full" />
                                    Communication
                                </h3>
                                <div className="space-y-3">
                                    <DetailItem label="Institutional Email" value={selectedEmployee?.email} icon={Mail} />
                                    <DetailItem label="Mobile Connection" value={selectedEmployee?.employee_detail?.mobile_no} icon={Phone} />
                                </div>
                            </div>
                        </div>

                        {/* Column 3: Background & Location */}
                        <div className="space-y-8">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 bg-orange-600 rounded-full" />
                                    Family Background
                                </h3>
                                <div className="space-y-3">
                                    <DetailItem label="Father's Name" value={selectedEmployee?.employee_detail?.father_name} icon={User} />
                                    <DetailItem label="Mother's Name" value={selectedEmployee?.employee_detail?.mother_name} icon={User} />
                                    <DetailItem label="Parental Records" value={selectedEmployee?.employee_detail?.parents_name} icon={Users} isMultiline />
                                </div>
                            </div>
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                                    <div className="h-1.5 w-1.5 bg-rose-600 rounded-full" />
                                    Full Address
                                </h3>
                                <div className="space-y-3">
                                    <DetailItem label="Residential Address" value={selectedEmployee?.employee_detail?.address} icon={MapPin} isMultiline />
                                </div>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}

function DetailItem({ label, value, icon: Icon, badge = false, isMultiline = false }: any) {
    if (!value) return null;
    return (
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-slate-50 transition-all duration-200 group border border-transparent hover:border-slate-100">
            <div className="mt-0.5 h-9 w-9 shrink-0 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1 leading-none">{label}</p>
                {badge ? (
                    <Badge variant="secondary" className="mt-1">{value}</Badge>
                ) : (
                    <p className={`text-[13px] text-slate-700 font-semibold leading-relaxed ${isMultiline ? 'whitespace-pre-line' : 'truncate'}`}>
                        {value}
                    </p>
                )}
            </div>
        </div>
    );
}
