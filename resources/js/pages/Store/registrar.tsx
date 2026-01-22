import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { CheckCircle, XCircle, ShoppingBag, Info, User, Hash } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Voucher Finalization', href: '/registrar/voucher-requests' }];

export default function RegistrarVoucherIndex({ vouchers }: any) {
    // Local state to track modified quantities
    const [quantities, setQuantities] = useState<Record<number, number>>(
        vouchers.reduce((acc: any, v: any) => ({ ...acc, [v.id]: v.requisitioned_quantity }), {})
    );

    const handleQuantityChange = (id: number, val: string) => {
        const num = parseInt(val) || 0;
        setQuantities(prev => ({ ...prev, [id]: num }));
    };

    const approve = (id: number) => {
        if (confirm('Are you sure you want to approve this voucher with the specified quantity?')) {
            router.post(`/registrar/voucher-requests/${id}/approve`, {
                requisitioned_quantity: quantities[id]
            });
        }
    };

    const deny = (id: number) => {
        if (confirm('Are you sure you want to deny this voucher?')) {
            router.post(`/registrar/voucher-requests/${id}/deny`);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Voucher Finalization - Registrar" />

            <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">Voucher Finalization</h1>
                            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                Review store requisitions and finalize quantities before issuance.
                            </p>
                        </div>
                        <div className="bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-lg flex items-center gap-2">
                            <Info size={18} />
                            <span className="font-semibold">{vouchers.length} Pending Approval</span>
                        </div>
                    </div>

                    {vouchers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                                <ShoppingBag size={48} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">No pending vouchers</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center mt-1">There are no requisition vouchers waiting for your finalization.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-center">Requisitioned By</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-center">Department</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-center">Product Name</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-center">Quantity</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 uppercase font-bold text-center">
                                        {vouchers.map((voucher: any) => (
                                            <tr key={voucher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-extrabold text-gray-900 dark:text-white uppercase">{voucher.requisitioned_by?.name || 'UNKNOWN'}</span>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">{voucher.requisitioned_by?.assignment?.designation?.designation_name ?? '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 uppercase">{voucher.department?.dept_name}</span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <ShoppingBag size={14} className="text-indigo-500" />
                                                        <span className="text-sm font-extrabold text-gray-900 dark:text-white uppercase">{voucher.product?.product_name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <div className="relative flex items-center max-w-[100px]">
                                                            <Hash size={14} className="absolute left-3 text-gray-400" />
                                                            <input
                                                                type="number"
                                                                value={quantities[voucher.id]}
                                                                onChange={(e) => handleQuantityChange(voucher.id, e.target.value)}
                                                                className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-extrabold focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all dark:text-white"
                                                                min="0"
                                                            />
                                                        </div>
                                                        <span className="text-xs font-bold text-gray-500 dark:text-gray-400 lowercase">{voucher.product?.stock_unit_name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center gap-3">
                                                        <button
                                                            onClick={() => approve(voucher.id)}
                                                            className="p-2.5 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-xl transition-all group relative"
                                                            title="Finalize & Approve"
                                                        >
                                                            <CheckCircle size={24} />
                                                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                Finalize & Approve
                                                            </span>
                                                        </button>
                                                        <button
                                                            onClick={() => deny(voucher.id)}
                                                            className="p-2.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all group relative"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={24} />
                                                            <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                                                Reject
                                                            </span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
