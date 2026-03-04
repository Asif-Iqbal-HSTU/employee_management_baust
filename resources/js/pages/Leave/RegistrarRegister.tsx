import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { Calendar, Users, Briefcase, Search, X, CheckCircle, Clock, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function RegistrarRegister({ departments, onLeaveToday }: any) {
    const [selectedDept, setSelectedDept] = useState('');
    const [employees, setEmployees] = useState<any[]>([]);
    const [fetchingEmp, setFetchingEmp] = useState(false);
    const [empSearch, setEmpSearch] = useState('');
    const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
    const [employeeLeaves, setEmployeeLeaves] = useState<any[]>([]);
    const [employeeModal, setEmployeeModal] = useState(false);
    const [fetchingLeaves, setFetchingLeaves] = useState(false);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (selectedDept) {
            fetchEmployees(selectedDept);
        } else {
            setEmployees([]);
        }
    }, [selectedDept]);

    const fetchEmployees = async (deptId: string) => {
        setFetchingEmp(true);
        try {
            const res = await fetch(`/registrar/leaves/department/${deptId}/employees`);
            const data = await res.json();
            setEmployees(data);
        } catch (error) {
            console.error("Failed to fetch employees", error);
        } finally {
            setFetchingEmp(false);
        }
    };

    const openEmployeeLeaves = async (emp: any) => {
        setSelectedEmployee(emp);
        setFetchingLeaves(true);
        setEmployeeModal(true);
        try {
            const res = await fetch(route('deptHead.employee.leaves', emp.employee_id));
            const data = await res.json();
            setEmployeeLeaves(data);
        } catch (error) {
            console.error("Failed to fetch leaves", error);
        } finally {
            setFetchingLeaves(false);
        }
    };

    const filteredEmployees = employees.filter((emp: any) =>
        emp.name.toLowerCase().includes(empSearch.toLowerCase()) ||
        emp.employee_id.includes(empSearch)
    );

    const getLeaveTypeColor = (type: string) => {
        switch (type) {
            case 'Casual Leave': return 'bg-blue-100 text-blue-700';
            case 'Medical Leave': return 'bg-rose-100 text-rose-700';
            case 'Earned Leave': return 'bg-violet-100 text-violet-700';
            case 'Duty Leave': return 'bg-teal-100 text-teal-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusColor = (status: string) => {
        if (status.includes('Approved')) return 'bg-emerald-100 text-emerald-700';
        if (status.includes('Rejected') || status.includes('Denied')) return 'bg-rose-100 text-rose-700';
        if (status.includes('Sent to Registrar')) return 'bg-amber-100 text-amber-700';
        return 'bg-blue-100 text-blue-700';
    };

    return (
        <AppLayout>
            <Head title="Leave Register - Registrar" />

            <div className="min-h-screen bg-gray-50/50 p-6">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">Leave Register Overview</h1>
                    <p className="text-gray-500 font-medium">Monitor employee leaves across all departments and faculty</p>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
                    {/* Filter Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                <Briefcase className="text-indigo-600" size={20} />
                                Select Department
                            </h2>
                            <select
                                value={selectedDept}
                                onChange={(e) => setSelectedDept(e.target.value)}
                                className="w-full rounded-2xl border-2 border-gray-100 p-3 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-medium text-gray-700"
                            >
                                <option value="">Choose a department...</option>
                                {departments.map((dept: any) => (
                                    <option key={dept.id} value={dept.id}>{dept.dept_name}</option>
                                ))}
                            </select>

                            {selectedDept && (
                                <div className="mt-6 animate-in fade-in duration-500">
                                    <div className="relative mb-4">
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                        <input
                                            type="text"
                                            placeholder="Search employee..."
                                            value={empSearch}
                                            onChange={(e) => setEmpSearch(e.target.value)}
                                            className="w-full rounded-2xl border-2 border-gray-100 py-3 pl-12 pr-4 outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="max-h-[500px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                                        {fetchingEmp ? (
                                            <div className="text-center py-10">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                                <p className="text-sm text-gray-500 mt-2">Loading employees...</p>
                                            </div>
                                        ) : filteredEmployees.length > 0 ? (
                                            filteredEmployees.map((emp: any) => (
                                                <button
                                                    key={emp.employee_id}
                                                    onClick={() => openEmployeeLeaves(emp)}
                                                    className="w-full flex items-center gap-3 p-3 rounded-2xl text-left bg-gray-50 hover:bg-indigo-50 hover:scale-[1.02] transition-all border border-transparent hover:border-indigo-100 group"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center font-bold text-indigo-600 shadow-sm border border-gray-100">
                                                        {emp.name.charAt(0)}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <p className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors uppercase truncate">{emp.name}</p>
                                                        <p className="text-xs text-gray-500 font-medium">{emp.designation}</p>
                                                    </div>
                                                </button>
                                            ))
                                        ) : (
                                            <p className="text-center py-10 text-gray-400 font-medium italic">No employees found</p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Dashboard Section */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* On Leave Today */}
                        <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-8 border-b border-gray-50 pb-6">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-sm">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">Staff On Leave Today</h2>
                                        <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">{today}</p>
                                    </div>
                                </div>
                                <div className="bg-rose-100 text-rose-700 px-4 py-2 rounded-xl font-black text-lg shadow-sm border border-rose-200">
                                    {onLeaveToday.length}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {onLeaveToday.length > 0 ? (
                                    onLeaveToday.map((leave: any) => (
                                        <div key={leave.id} className="relative group overflow-hidden bg-gradient-to-br from-white to-gray-50/50 rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all hover:-translate-y-1">
                                            <div className="flex items-start justify-between mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center font-black text-xl text-indigo-600 shadow-lg border-2 border-indigo-50">
                                                        {leave.user?.name.charAt(0)}
                                                    </div>
                                                    <div className="overflow-hidden">
                                                        <h3 className="font-black text-gray-900 uppercase line-clamp-1">{leave.user?.name}</h3>
                                                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{leave.user?.employee_id}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider ${getLeaveTypeColor(leave.type)}`}>
                                                    {leave.type.replace(' Leave', '')}
                                                </span>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Briefcase size={14} className="text-gray-400" />
                                                    <p className="text-xs font-bold uppercase truncate">{leave.user?.assignment?.department?.dept_name}</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-500">
                                                    <Clock size={14} className="text-gray-400" />
                                                    <p className="text-[11px] font-bold">{leave.start_date} <span className="text-gray-300 mx-1">→</span> {leave.end_date}</p>
                                                </div>
                                            </div>

                                            <div className="mt-4 pt-4 border-t border-dashed border-gray-100 flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-gray-400 lowercase italic">status:</span>
                                                <span className={`${getStatusColor(leave.status)} px-2 py-0.5 rounded-md`}>{leave.status}</span>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                                        <Calendar size={48} className="mb-4 opacity-20" />
                                        <p className="text-xl font-black uppercase tracking-tight">No Employees On Leave Today</p>
                                        <p className="font-bold text-sm">Everything is running as scheduled</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Summary / Instructions placeholder */}
                        {!selectedDept && (
                            <div className="bg-indigo-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
                                <div className="relative z-10 flex items-center gap-8">
                                    <div className="hidden md:flex h-20 w-20 rounded-full bg-white/20 items-center justify-center backdrop-blur-md">
                                        <Users size={40} />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black uppercase tracking-tight mb-2">Detailed Leave Explorer</h2>
                                        <p className="text-indigo-100 font-bold text-lg max-w-xl leading-relaxed">
                                            Select a department from the sidebar to browse individual employee leave histories, view processed requests, and analyze departmental attendance patterns.
                                        </p>
                                    </div>
                                </div>
                                {/* Decorative elements */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl"></div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Employee History Modal */}
            {employeeModal && selectedEmployee && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setEmployeeModal(false)}></div>
                    <div className="relative w-full max-w-4xl bg-white rounded-[32px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-8 duration-500">
                        {/* Modal Header */}
                        <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gray-50/50">
                            <div className="flex items-center gap-5">
                                <div className="h-16 w-16 rounded-3xl bg-indigo-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/30">
                                    {selectedEmployee.name.charAt(0)}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">{selectedEmployee.name}</h2>
                                    <div className="flex items-center gap-4 mt-1">
                                        <p className="text-indigo-600 font-black text-xs uppercase tracking-widest">{selectedEmployee.employee_id}</p>
                                        <span className="h-1 w-1 bg-gray-300 rounded-full"></span>
                                        <p className="text-gray-500 font-bold text-xs uppercase tracking-widest">{selectedEmployee.designation}</p>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setEmployeeModal(false)}
                                className="h-12 w-12 rounded-2xl bg-white border-2 border-gray-100 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:border-rose-100 hover:bg-rose-50 transition-all shadow-sm"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="flex-1 overflow-auto p-8 bg-white">
                            {fetchingLeaves ? (
                                <div className="flex flex-col items-center justify-center py-20">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-indigo-600 mb-4"></div>
                                    <p className="font-black text-gray-500 uppercase tracking-widest">Compiling Leave History...</p>
                                </div>
                            ) : employeeLeaves.length > 0 ? (
                                <div className="space-y-4">
                                    <table className="w-full text-left border-separate border-spacing-y-3">
                                        <thead>
                                            <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                                                <th className="px-6 py-2">Leave Type</th>
                                                <th className="px-6 py-2">Duration</th>
                                                <th className="px-6 py-2 text-center">Days</th>
                                                <th className="px-6 py-2">Reason</th>
                                                <th className="px-6 py-2">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {employeeLeaves.map((l: any, i: number) => (
                                                <tr key={i} className="group transition-all">
                                                    <td className="px-6 py-4 bg-gray-50 rounded-l-2xl border-y border-l border-gray-100 group-hover:bg-white group-hover:border-indigo-100">
                                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getLeaveTypeColor(l.type)}`}>
                                                            {l.type}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 bg-gray-50 border-y border-gray-100 group-hover:bg-white group-hover:border-indigo-100 font-bold text-gray-700 text-xs">
                                                        <div className="flex items-center gap-3">
                                                            {l.start_date}
                                                            <span className="text-gray-300">→</span>
                                                            {l.end_date}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 bg-gray-50 border-y border-gray-100 group-hover:bg-white group-hover:border-indigo-100 text-center">
                                                        <span className="bg-white px-3 py-1 rounded-lg border border-gray-100 font-black text-indigo-600 text-xs shadow-sm">
                                                            {l.days}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 bg-gray-50 border-y border-gray-100 group-hover:bg-white group-hover:border-indigo-100">
                                                        <p className="text-[11px] text-gray-600 font-medium italic line-clamp-1 group-hover:line-clamp-none max-w-xs">{l.reason || 'No reason provided'}</p>
                                                    </td>
                                                    <td className="px-6 py-4 bg-gray-50 rounded-r-2xl border-y border-r border-gray-100 group-hover:bg-white group-hover:border-indigo-100">
                                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${getStatusColor(l.status)} ring-2 ring-white`}>
                                                            {l.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                    <ClipboardList size={64} className="mb-4 opacity-20" />
                                    <p className="text-xl font-black uppercase tracking-tight">Clean Record</p>
                                    <p className="font-bold text-sm">No leave application found for this employee</p>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="p-8 border-t border-gray-100 bg-gray-50/50 flex justify-end">
                            <button
                                onClick={() => setEmployeeModal(false)}
                                className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all hover:-translate-y-1 shadow-xl shadow-slate-900/20"
                            >
                                Close Explorer
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }
            `}} />
        </AppLayout>
    );
}
