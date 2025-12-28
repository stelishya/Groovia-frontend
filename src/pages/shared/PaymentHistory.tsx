import React, { useEffect, useState, useCallback } from 'react';
import { UserTable } from '../../components/ui/Table';
import { UserPagination } from '../../components/ui/Pagination';
import { getPaymentHistory } from '../../services/payment/payment.service';
import type { PaymentFilters } from '../../services/payment/payment.service';
import { Search, Filter, CreditCard, ArrowUpDown, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import Sidebar from '../../components/shared/Sidebar';
import UserNavbar from '../../components/shared/Navbar';
import { useSelector } from 'react-redux';
import type { RootState } from '../../redux/store';

const PaymentHistory: React.FC = () => {
    const { userData } = useSelector((state: RootState) => state.user);
    const [payments, setPayments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState<PaymentFilters>({
        page: 1,
        limit: 10,
        search: '',
        type: '',
        status: '',
        sortBy: 'newest'
    });

    const fetchHistory = useCallback(async (currentFilters: PaymentFilters) => {
        setLoading(true);
        try {
            const result = await getPaymentHistory(currentFilters);
            console.log("Payment History in frontend : ",result);
            if (result.success) {
                setPayments(result.data.payments);
                setTotal(result.data.total);
            } else {
                toast.error(result.message);
            }
        } catch (error) {
            toast.error('Failed to load payment history');
        } finally {
            setLoading(false);
        }
    }, []);

    // Instant filtering with debounce for search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchHistory(filters);
        }, 300); // 300ms debounce
        return () => clearTimeout(timer);
    }, [filters, fetchHistory]);

    const handleFilterChange = (key: keyof PaymentFilters, value: any) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: key === 'page' ? value : 1 // Reset to page 1 for other filter changes
        }));
    };

    return (
        <div className="flex min-h-screen bg-[#0a0516]">
            <Sidebar activeMenu="Payments" />

            <div className="flex-1 flex flex-col min-w-0">
                <UserNavbar />

                <main className="flex-1 p-6 lg:p-8 overflow-y-auto custom-scrollbar">
                    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Header Section */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-200 to-purple-400 bg-clip-text text-transparent">
                                    Payment History
                                </h1>
                                <p className="text-purple-300/60 mt-2 font-medium">Track all your transactions and bookings</p>
                            </div>

                            <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/20 border border-purple-500/20 rounded-xl">
                                <span className="text-purple-300/80 text-sm">Total Transactions:</span>
                                <span className="text-white font-bold">{total}</span>
                            </div>
                        </div>

                        {/* Filters Section */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 bg-purple-900/10 p-5 rounded-2xl border border-purple-500/10 backdrop-blur-md">
                            {/* Search */}
                            <div className="lg:col-span-2 relative group">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400 group-focus-within:text-purple-300 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by event, name or ID..."
                                    className="w-full bg-purple-950/30 border-purple-500/20 border rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-purple-300/30 focus:outline-none focus:border-purple-500/50 transition-all focus:ring-1 focus:ring-purple-500/30"
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                />
                                <X className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" onClick={() => handleFilterChange('search', '')} />
                            </div>

                            {/* Filter Type */}
                            <div className="relative group">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                                <select
                                    className="w-full bg-purple-950/30 border-purple-500/20 border rounded-xl py-2.5 pl-10 pr-8 text-sm text-white focus:outline-none focus:border-purple-500/50 appearance-none transition-all cursor-pointer"
                                    value={filters.type}
                                    onChange={(e) => handleFilterChange('type', e.target.value)}
                                >
                                    <option value="" className="bg-[#1a142e]">All Types</option>
                                    <option value="workshop" className="bg-[#1a142e]">Workshop</option>
                                    <option value="competition" className="bg-[#1a142e]">Competition</option>
                                    <option value="event_booking" className="bg-[#1a142e]">Event Booking</option>
                                    <option value="role_upgrade" className="bg-[#1a142e]">Role Upgrade</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
                                    <ArrowUpDown size={14} />
                                </div>
                            </div>

                            {/* Filter Status */}
                            <div className="relative group">
                                <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                                <select
                                    className="w-full bg-purple-950/30 border-purple-500/20 border rounded-xl py-2.5 pl-10 pr-8 text-sm text-white focus:outline-none focus:border-purple-500/50 appearance-none transition-all cursor-pointer"
                                    value={filters.status}
                                    onChange={(e) => handleFilterChange('status', e.target.value)}
                                >
                                    <option value="" className="bg-[#1a142e]">All Status</option>
                                    <option value="success" className="bg-[#1a142e]">Success</option>
                                    <option value="pending" className="bg-[#1a142e]">Pending</option>
                                    <option value="failed" className="bg-[#1a142e]">Failed</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
                                    <ArrowUpDown size={14} />
                                </div>
                            </div>

                            {/* Sort */}
                            <div className="relative group">
                                <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
                                <select
                                    className="w-full bg-purple-950/30 border-purple-500/20 border rounded-xl py-2.5 pl-10 pr-8 text-sm text-white focus:outline-none focus:border-purple-500/50 appearance-none transition-all cursor-pointer"
                                    value={filters.sortBy}
                                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                                >
                                    <option value="newest" className="bg-[#1a142e]">Newest First</option>
                                    <option value="oldest" className="bg-[#1a142e]">Oldest First</option>
                                    <option value="amount" className="bg-[#1a142e]">Highest Amount</option>
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-purple-400">
                                    <ArrowUpDown size={14} />
                                </div>
                            </div>
                        </div>

                        {/* Table Container */}
                        <div className="relative group overflow-hidden rounded-2xl border border-purple-500/20 bg-purple-900/5 backdrop-blur-sm shadow-2xl">
                            {loading && (
                                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[2px]">
                                    <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
                                </div>
                            )}
                            <UserTable
                                data={payments}
                                variant="payments"
                                currentUserId={userData?._id}
                            />

                            {payments.length === 0 && !loading && (
                                <div className="py-20 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 mb-4">
                                        <CreditCard className="h-8 w-8 text-purple-400" />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">No transactions found</h3>
                                    <p className="text-purple-300/60 mt-1">Try adjusting your filters or search terms</p>
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {total > 0 && (
                            <div className="bg-purple-950/20 rounded-2xl border border-purple-500/10 overflow-hidden">
                                <UserPagination
                                    current={filters.page || 1}
                                    total={total}
                                    pageSize={filters.limit || 10}
                                    onChange={(page) => handleFilterChange('page', page)}
                                    className="!bg-transparent !border-none"
                                />
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default PaymentHistory;
