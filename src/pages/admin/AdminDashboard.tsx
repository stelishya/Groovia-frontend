import { useEffect, useState } from 'react';
import Sidebar from '../../components/admin/Sidebar';
import DashboardStats from '../../components/admin/DashboardStats';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '../../components/ui/Chart';
import { ExportButtons } from '../../components/admin/ExportButtons';
import { AdminAxios } from '../../api/user.axios';

type Point = { label: string; value: number };

const AdminDashboard: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [totals, setTotals] = useState<any>(null);
    const [userGrowth, setUserGrowth] = useState<Point[]>([]);
    const [revenueTrend, setRevenueTrend] = useState<Point[]>([]);
    const [interval, setInterval] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await AdminAxios.get('/dashboard');
                setTotals(res.data);

                const ug = await AdminAxios.get(`/dashboard/user-growth?interval=${interval}`);
                // Format date as dd-mm-yyyy if label matches yyyy-mm-dd
                setUserGrowth(ug.data.map((d: Point) => {
                    if (/^\d{4}-\d{2}-\d{2}$/.test(d.label)) {
                        const [y, m, day] = d.label.split('-');
                        return { ...d, label: `${day}-${m}-${y}` };
                    }
                    return d;
                }));

                const rt = await AdminAxios.get(`/dashboard/revenue-trend?interval=${interval}`);
                setRevenueTrend(rt.data.map((d: Point) => {
                    if (/^\d{4}-\d{2}-\d{2}$/.test(d.label)) {
                        const [y, m, day] = d.label.split('-');
                        return { ...d, label: `${day}-${m}-${y}` };
                    }
                    return d;
                }));
            } catch (err) {
                console.error('Failed to load dashboard', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [interval]);


    return (
        <div className="flex h-screen bg-[#0B1120]">
            <Sidebar />
            <div className="flex-1 ml-64 overflow-y-auto">
                <main className="min-h-screen p-8">
                    <div className="flex justify-between items-center">
                        <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
                        <div>
                            <ExportButtons data={totals} userGrowth={userGrowth} revenueTrend={revenueTrend} />
                        </div>
                    </div>

                    <div className="mb-4 flex gap-2">
                        <label className="text-white">Interval:</label>
                        <select
                            className="bg-[#1a2332] text-white rounded px-2 py-1"
                            value={interval}
                            onChange={e => setInterval(e.target.value as any)}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                            <option value="yearly">Yearly</option>
                        </select>
                    </div>

                    {loading ? (
                        <div className="text-gray-300">Loading...</div>
                    ) : (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <DashboardStats title="Total Users" value={totals?.totals.users.total ?? 0} />
                                <DashboardStats title="Total Workshops" value={totals?.totals.workshops ?? 0} />
                                <DashboardStats title="Total Competitions" value={totals?.totals.competitions ?? 0} />
                                <DashboardStats title="Total Revenue" value={`₹ ${totals?.totals.revenue ?? 0}`} />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <h3 className="text-white mb-2">User Growth</h3>
                                    <ChartContainer>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={userGrowth} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" stroke="#fff" />
                                                <YAxis stroke="#fff" />
                                                <Tooltip content={<ChartTooltipContent />} />
                                                <Line type="monotone" dataKey="value" stroke="#60a5fa" strokeWidth={3} dot />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                                <div>
                                    <h3 className="text-white mb-2">Revenue Trend</h3>
                                    <ChartContainer>
                                        <ResponsiveContainer width="100%" height={300}>
                                            <LineChart data={revenueTrend} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="label" stroke="#fff" />
                                                <YAxis stroke="#fff" />
                                                <Tooltip content={<ChartTooltipContent />} />
                                                <Line type="monotone" dataKey="value" stroke="#34d399" strokeWidth={3} dot />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </ChartContainer>
                                </div>
                            </div>

                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;