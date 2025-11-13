import React, { useState, useEffect } from "react";
import { router, Head } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";

export default function Create() {
    const [form, setForm] = useState({
        department: "",
        submission_date: "",
        submission_time: "",
        contact_person: "",
        designation: "",
        contact_no: "",
        email: "",
        device_type: "",
        brand_model: "",
        asset_id: "",
        serial_number: "",
        accessories: ["", "", "", ""],
        problem_description: "",
    });

    // 🕒 Automatically set current date and time on load
    useEffect(() => {
        const now = new Date();

        // Get date in YYYY-MM-DD format
        const date = now.toISOString().split("T")[0];

        // Get time in HH:MM format
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
        router.post(route("repair.store"), form);
    };

    return (
        <AppLayout title="Submit Repair Request">
            <Head title="New Repair Request" />
            <div className="max-w-3xl mx-auto bg-white p-6 rounded-2xl shadow">
                <h1 className="text-2xl font-bold mb-4 text-center">Device Repair Submission Form</h1>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input
                            name="department"
                            placeholder="Department/Office"
                            onChange={handleChange}
                            className="input"
                            required
                        />
                        <input
                            type="date"
                            name="submission_date"
                            value={form.submission_date}
                            readOnly
                            className="input bg-gray-100 cursor-not-allowed"
                        />
                        <input
                            type="time"
                            name="submission_time"
                            value={form.submission_time}
                            readOnly
                            className="input bg-gray-100 cursor-not-allowed"
                        />
                        <input
                            name="contact_person"
                            placeholder="Contact Person"
                            onChange={handleChange}
                            className="input"
                            required
                        />
                        <input
                            name="designation"
                            placeholder="Designation"
                            onChange={handleChange}
                            className="input"
                        />
                        <input
                            name="contact_no"
                            placeholder="Contact No"
                            onChange={handleChange}
                            className="input"
                            required
                        />
                        <input
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Device Type</label>
                        <select
                            name="device_type"
                            onChange={handleChange}
                            className="input mt-1"
                            required
                        >
                            <option value="">Select</option>
                            <option>Desktop PC</option>
                            <option>Laptop</option>
                            <option>Printer</option>
                            <option>Projector</option>
                            <option>Air Conditioner</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <input
                            name="brand_model"
                            placeholder="Brand & Model"
                            onChange={handleChange}
                            className="input"
                        />
                        <input
                            name="asset_id"
                            placeholder="Asset/Inventory ID"
                            onChange={handleChange}
                            className="input"
                        />
                        <input
                            name="serial_number"
                            placeholder="Serial Number"
                            onChange={handleChange}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="font-semibold">Accessories</label>
                        {form.accessories.map((acc, i) => (
                            <input
                                key={i}
                                name={`accessory_${i}`}
                                placeholder={`Accessory ${i + 1}`}
                                value={acc}
                                onChange={e => {
                                    const arr = [...form.accessories];
                                    arr[i] = e.target.value;
                                    setForm({ ...form, accessories: arr });
                                }}
                                className="input mt-1"
                            />
                        ))}
                    </div>

                    <textarea
                        name="problem_description"
                        placeholder="Detailed Description of the Problem"
                        onChange={handleChange}
                        className="input h-32"
                    />

                    <button
                        type="submit"
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
