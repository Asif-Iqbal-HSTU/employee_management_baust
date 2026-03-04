import React, { useState, useEffect } from "react";
import { router, Head, usePage } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import { FileText, Send, Monitor, User, Info, AlertCircle, Plus } from "lucide-react";

export default function Create({ autoDepartment, autoDesignation }: { autoDepartment: string, autoDesignation: string }) {
    const { auth }: any = usePage().props;
    const [form, setForm] = useState({
        department: autoDepartment || "",
        submission_date: "",
        submission_time: "",
        contact_person: auth.user.name || "",
        designation: autoDesignation || "",
        contact_no: "",
        email: auth.user.email || "",
        device_type: "",
        other_device: "",
        brand_model: "",
        asset_id: "",
        serial_number: "",
        accessories: ["", "", "", ""],
        problem_description: "",
    });

    // 🕒 Automatically set current date and time on load
    useEffect(() => {
        const now = new Date();
        const date = now.toISOString().split("T")[0];
        const time = now.toTimeString().slice(0, 5);

        setForm(prev => ({
            ...prev,
            submission_date: date,
            submission_time: time,
        }));
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const submissionData = { ...form };
        if (form.device_type === 'Other' && form.other_device) {
            submissionData.device_type = `Other: ${form.other_device}`;
        }
        router.post(route("repair.store"), submissionData);
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Repair Requests', href: route('repair.index') }, { title: 'New Request', href: '#' }]}>
            <Head title="New Repair Request" />
            <div className="max-w-4xl mx-auto space-y-6 pb-20">
                <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 relative overflow-hidden">
                    {/* Header with formal look */}
                    <div className="text-center mb-10 border-b border-dashed border-gray-200 pb-8">
                        <div className="inline-flex p-3 bg-indigo-50 rounded-2xl mb-4 text-indigo-600">
                            <FileText size={32} />
                        </div>
                        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">ICT Wing and Archive</h2>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">DEVICE REPAIR SUBMISSION FORM</h1>
                        <div className="flex justify-between items-center mt-6 text-[10px] font-bold text-gray-400 px-4">
                            <span>Form No: BAUST/ICT/REPAIR/F-01</span>
                            <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">JOB ID: AUTO-GENERATED</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Part A Section */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-3 border-l-4 border-indigo-600 pl-4 py-1 bg-indigo-50/30 rounded-r-xl">
                                <User className="text-indigo-600" size={20} />
                                <h3 className="text-lg font-bold text-gray-900 italic">Part A: To be filled by the Submitting Department</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1.5 md:col-span-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">1. Submitting Department/Office</label>
                                    <input
                                        name="department"
                                        value={form.department}
                                        placeholder="Deparment Name"
                                        onChange={handleChange}
                                        readOnly={!!autoDepartment}
                                        className={`w-full px-5 py-3 rounded-2xl border-2 font-medium outline-none transition-all ${autoDepartment ? 'bg-gray-50 border-gray-50 text-gray-500 cursor-not-allowed' : 'border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'}`}
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">2. Submission Date</label>
                                    <input
                                        type="date"
                                        name="submission_date"
                                        value={form.submission_date}
                                        readOnly
                                        className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-2 border-gray-50 text-gray-500 cursor-not-allowed outline-none font-medium"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Submission Time</label>
                                    <input
                                        type="time"
                                        name="submission_time"
                                        value={form.submission_time}
                                        readOnly
                                        className="w-full px-5 py-3 rounded-2xl bg-gray-50 border-2 border-gray-50 text-gray-500 cursor-not-allowed outline-none font-medium"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">3. Contact Person</label>
                                    <input
                                        name="contact_person"
                                        value={form.contact_person}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Designation</label>
                                    <input
                                        name="designation"
                                        value={form.designation}
                                        placeholder="Designation"
                                        onChange={handleChange}
                                        readOnly={!!autoDesignation}
                                        className={`w-full px-5 py-3 rounded-2xl border-2 font-medium outline-none transition-all ${autoDesignation ? 'bg-gray-50 border-gray-50 text-gray-500 cursor-not-allowed' : 'border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5'}`}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">4. Contact Number</label>
                                    <input
                                        name="contact_no"
                                        placeholder="e.g. 01712xxxxxx"
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-medium"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Device Info Section */}
                        <section className="space-y-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-3 border-l-4 border-orange-500 pl-4 py-1 bg-orange-50/30 rounded-r-xl">
                                <Info className="text-orange-500" size={20} />
                                <h3 className="text-lg font-bold text-gray-900 italic">5. Device Information</h3>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">A. Device Type (Select One)</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                    {["Desktop PC", "Laptop", "Printer", "Projector", "Air Conditioner", "Other"].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setForm({ ...form, device_type: type })}
                                            className={`p-3 rounded-2xl text-xs font-bold transition-all border-2 ${form.device_type === type ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-105" : "bg-white border-gray-100 text-gray-500 hover:border-gray-200"}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                {form.device_type === "Other" && (
                                    <input
                                        name="other_device"
                                        placeholder="Specify record type..."
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-indigo-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-medium animate-in slide-in-from-top-2"
                                    />
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">B. Brand & Model</label>
                                    <input
                                        name="brand_model"
                                        placeholder="e.g. HP ProBook 450 G8"
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">C. Asset/Inventory ID</label>
                                    <input
                                        name="asset_id"
                                        placeholder="BAUST/ASSET/XXXX"
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-medium"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">D. Serial Number</label>
                                    <input
                                        name="serial_number"
                                        placeholder="S/N: XXXXXXXX"
                                        onChange={handleChange}
                                        className="w-full px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-600/5 transition-all outline-none font-medium"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Accessories Section */}
                        <section className="space-y-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-3 border-l-4 border-teal-500 pl-4 py-1 bg-teal-50/30 rounded-r-xl">
                                <Plus className="text-teal-500" size={20} />
                                <h3 className="text-lg font-bold text-gray-900 italic">6. List of Submitted Accessories</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {form.accessories.map((acc, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center font-black text-xs">{String.fromCharCode(65 + i)}</span>
                                        <input
                                            name={`accessory_${i}`}
                                            placeholder={`Accessory (e.g. Power Adapter, Mouse, Cable)`}
                                            value={acc}
                                            onChange={e => {
                                                const arr = [...form.accessories];
                                                arr[i] = e.target.value;
                                                setForm({ ...form, accessories: arr });
                                            }}
                                            className="flex-1 px-5 py-3 rounded-2xl border-2 border-gray-100 focus:border-teal-500 focus:ring-4 focus:ring-teal-500/5 transition-all outline-none font-medium"
                                        />
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Problem Description */}
                        <section className="space-y-6 pt-6 border-t border-gray-100">
                            <div className="flex items-center gap-3 border-l-4 border-red-500 pl-4 py-1 bg-red-50/30 rounded-r-xl">
                                <AlertCircle className="text-red-500" size={20} />
                                <h3 className="text-lg font-bold text-gray-900 italic">7. Detailed Description of the Problem / Fault</h3>
                            </div>
                            <textarea
                                name="problem_description"
                                placeholder="Please provide as much detail as possible about the issue..."
                                onChange={handleChange}
                                className="w-full px-6 py-5 rounded-3xl border-2 border-gray-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/5 transition-all outline-none h-40 font-medium font-serif"
                                required
                            />
                        </section>

                        {/* Submit Button */}
                        <div className="pt-10 flex flex-col items-center gap-4">
                            <button
                                type="submit"
                                className="w-full md:w-auto min-w-[300px] flex items-center justify-center gap-3 bg-indigo-600 text-white px-10 py-5 rounded-2xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-600/30 hover:-translate-y-1 font-black text-lg"
                            >
                                <Send size={24} />
                                <span>SUBMIT REQUEST</span>
                            </button>
                            <p className="text-xs text-gray-400">By submitting, you agree to the IT Repair Cell terms and conditions.</p>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
