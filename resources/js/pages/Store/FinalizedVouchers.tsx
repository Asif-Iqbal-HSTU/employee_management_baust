import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ShoppingBag, Info, User, CheckCircle, XCircle, Search, ArrowLeft } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Voucher Finalization', href: '/registrar/voucher-requests' },
    { title: 'Finalized Vouchers', href: '/registrar/voucher-requests/finalized' }
];

export default function FinalizedVouchers({ vouchers }: any) {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredVouchers = vouchers.data.filter((v: any) =>
        (v.requisitioned_by?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.product?.product_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.department?.dept_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Finalized Vouchers - Registrar" />

            <div className="p-6 min-h-screen bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Link href="/registrar/voucher-requests" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1">
                                    <ArrowLeft size={20} />
                                </Link>
                                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white uppercase tracking-tight">Finalized Vouchers</h1>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                History of requisition vouchers that have been processed.
                            </p>
                        </div>

                        <div className="relative max-w-sm w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, product or dept..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    {filteredVouchers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
                                <ShoppingBag size={48} className="text-gray-400 dark:text-gray-500" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white text-center">No records found</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-center mt-1">Adjust your search or check back later.</p>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-700/50">
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-center">Date</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-center">Requisitioned By</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-center">Product & Dept</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-center">Quantity</th>
                                            <th className="p-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b dark:border-gray-700 text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700 uppercase font-bold text-center">
                                        {filteredVouchers.map((voucher: any) => (
                                            <tr key={voucher.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                                <td className="p-4">
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(voucher.updated_at).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-extrabold text-gray-900 dark:text-white uppercase">{voucher.requisitioned_by?.name || 'UNKNOWN'}</span>
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400">{voucher.requisitioned_by?.assignment?.designation?.designation_name ?? '—'}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-sm font-extrabold text-gray-900 dark:text-white uppercase">{voucher.product?.product_name}</span>
                                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase">{voucher.department?.dept_name}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4">
                                                    <span className="text-sm font-extrabold text-gray-900 dark:text-white">
                                                        {voucher.requisitioned_quantity} {voucher.product?.stock_unit_name}
                                                    </span>
                                                </td>
                                                <td className="p-4">
                                                    <div className="flex items-center justify-center">
                                                        {voucher.allowed_by_registrar === 'Yes' ? (
                                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full text-[10px]">
                                                                <CheckCircle size={14} />
                                                                ACCEPTED
                                                            </div>
                                                        ) : (
                                                            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-[10px]">
                                                                <XCircle size={14} />
                                                                REJECTED
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Simple Pagination */}
                            <div className="p-4 border-t dark:border-gray-700 flex justify-center gap-2">
                                {vouchers.links.map((link: any, i: number) => (
                                    <Link
                                        key={i}
                                        href={link.url || '#'}
                                        className={`px-3 py-1 rounded-md text-sm ${link.active ? 'bg-amber-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'} ${!link.url && 'opacity-50 cursor-not-allowed'}`}
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
