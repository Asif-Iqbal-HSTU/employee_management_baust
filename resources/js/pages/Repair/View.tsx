import React from "react";
import { Head, Link } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { ArrowLeft, Download, FileText, Settings, User, Phone, Calendar, Clock, CheckCircle, Truck, Wrench } from "lucide-react";

export default function View({ request }: any) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case "Pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
            case "Completed": return "bg-green-100 text-green-800 border-green-200";
            case "Delivered": return "bg-purple-100 text-purple-800 border-purple-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Repair Requests', href: route('repair.index') }, { title: 'View Details', href: '#' }]}>
            <Head title={`Repair Request - ${request.job_id || 'Details'}`} />
            <div className="max-w-5xl mx-auto space-y-6 pb-12">
                <div className="flex items-center justify-between">
                    <Link
                        href={route('repair.index')}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Back to List</span>
                    </Link>
                    <a
                        href={route('repair.download', request.id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-all shadow-md"
                        target="_blank"
                    >
                        <Download size={18} />
                        <span>Download PDF</span>
                    </a>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content - Part A */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <FileText className="text-indigo-600" size={20} />
                                    Part A: Submission Information
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Department</p>
                                        <p className="text-sm font-medium text-gray-900">{request.department}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Person</p>
                                        <p className="text-sm font-medium text-gray-900">{request.contact_person} ({request.designation})</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Submission Date & Time</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(request.submission_date).toLocaleDateString()} at {request.submission_time}
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Contact Info</p>
                                        <p className="text-sm font-medium text-gray-900">{request.contact_no} / {request.email || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Device Details</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase mb-1">Device Type</p>
                                            <p className="text-sm font-bold text-gray-800">{request.device_type}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase mb-1">Brand & Model</p>
                                            <p className="text-sm font-bold text-gray-800">{request.brand_model || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase mb-1">Asset ID</p>
                                            <p className="text-sm font-bold text-gray-800">{request.asset_id || 'N/A'}</p>
                                        </div>
                                        <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <p className="text-[10px] text-gray-400 uppercase mb-1">Serial Number</p>
                                            <p className="text-sm font-bold text-gray-800">{request.serial_number || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-50">
                                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Problem Description</p>
                                    <div className="p-4 bg-red-50/50 rounded-xl border border-red-100 text-sm text-gray-700 italic">
                                        "{request.problem_description}"
                                    </div>
                                </div>

                                {request.accessories && request.accessories.length > 0 && (
                                    <div className="pt-4 border-t border-gray-50">
                                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Submitted Accessories</p>
                                        <div className="flex flex-wrap gap-2">
                                            {request.accessories.filter((a: any) => a).map((acc: any, i: number) => (
                                                <span key={i} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                                                    {acc}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {request.completed_actions && (
                            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="p-6 border-b border-gray-100 bg-green-50/30">
                                    <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <CheckCircle className="text-green-600" size={20} />
                                        Completed Actions
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
                                        {request.completed_actions}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Part B */}
                    <div className="space-y-6">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sticky top-6">
                            <div className="p-6 border-b border-gray-100 bg-indigo-50/30">
                                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Settings className="text-indigo-600" size={20} />
                                    Official Status
                                </h2>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="text-center pb-4 border-b border-gray-100">
                                    <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Job Number</p>
                                    <p className="text-2xl font-black text-indigo-600 tracking-tighter">{request.job_id || 'PENDING'}</p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Current Status</p>
                                        <span className={`w-full justify-center inline-flex items-center px-4 py-2 rounded-xl text-sm font-bold border ${getStatusColor(request.status)}`}>
                                            {request.status}
                                        </span>
                                    </div>

                                    {request.state && (
                                        <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                                            <p className="text-xs font-semibold text-indigo-400 uppercase mb-1">Current State</p>
                                            <p className="text-sm font-bold text-indigo-900 uppercase italic">"{request.state}"</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="flex items-start gap-3">
                                        <User size={16} className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase">Assigned To</p>
                                            <p className="text-sm font-medium text-gray-900">{request.assigned_to || 'Not Assigned'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Phone size={16} className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase">Contact</p>
                                            <p className="text-sm font-medium text-gray-900">{request.assigned_phone || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Calendar size={16} className="text-gray-400 mt-1" />
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 uppercase">Expected Delivery</p>
                                            <p className="text-sm font-medium text-gray-900">{request.expected_delivery ? new Date(request.expected_delivery).toLocaleDateString() : 'TBD'}</p>
                                        </div>
                                    </div>
                                </div>

                                {request.initial_observation && (
                                    <div className="pt-4 border-t border-gray-100">
                                        <p className="text-xs font-semibold text-gray-400 uppercase mb-2">Technical Remarks</p>
                                        <p className="text-sm text-gray-600 italic">"{request.initial_observation}"</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
