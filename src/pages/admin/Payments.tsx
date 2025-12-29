import { useEffect, useState } from "react";
import { Table, type TableColumn } from "../../components/ui/Table";
import { AdminAxios } from "../../api/user.axios";
import Sidebar from "../../components/admin/Sidebar";
import {Pagination} from "../../components/ui/Pagination";

interface Payment {
  _id: string;
  referenceId: string;
  orderId: string;
  createdAt: string;
  user: {
    _id: string;
    username: string;
    email: string;
    role: string[];
  };
  paymentType: string;
  relatedEntityName?: string;
  relatedEntityId?: string;
  amount: number;
  status: string;
  failureReason?: string;
  refundStatus?: string;
  refundAmount?: number;
  payoutStatus?: string;
  payoutDate?: string;
  beneficiary?: string;
  settlementReferenceId?: string;
}

const columns: TableColumn<Payment>[] = [
  { key: "referenceId", title: "Payment ID", dataIndex: "referenceId", sortable: true },
  { key: "orderId", title: "Order ID", dataIndex: "orderId", sortable: true },
  { key: "createdAt", title: "Date & Time", dataIndex: "createdAt", sortable: true, render: v => new Date(v).toLocaleString() },
  { key: "user", title: "User Name", dataIndex: "user", render: (v) => v?.username },
  { key: "userRole", title: "User Role", dataIndex: "user", render: (v) => v?.role?.join(", ") },
  { key: "userEmail", title: "User Email", dataIndex: "user", render: (v) => v?.email },
  { key: "userId", title: "User ID", dataIndex: "user", render: (v) => v?._id },
  { key: "paymentType", title: "Payment Type", dataIndex: "paymentType", sortable: true },
  { key: "relatedEntityName", title: "Related Entity", dataIndex: "relatedEntityName" },
  { key: "amount", title: "Total Amount Paid", dataIndex: "amount", sortable: true, render: v => `₹${v}` },
  { key: "platformFee", title: "Platform Fee (20%)", dataIndex: "amount", render: v => `₹${(v * 0.2).toFixed(2)}` },
  { key: "organizerShare", title: "Organizer/Instructor Share", dataIndex: "amount", render: v => `₹${(v * 0.8).toFixed(2)}` },
  { key: "status", title: "Status", dataIndex: "status", sortable: true },
  { key: "failureReason", title: "Failure Reason", dataIndex: "failureReason" },
  { key: "refundStatus", title: "Refund Status", dataIndex: "refundStatus" },
  { key: "refundAmount", title: "Refund Amount", dataIndex: "refundAmount", render: v => v ? `₹${v}` : "-" },
  { key: "payoutStatus", title: "Payout Status", dataIndex: "payoutStatus" },
  { key: "payoutDate", title: "Payout Date", dataIndex: "payoutDate", render: v => v ? new Date(v).toLocaleDateString() : "-" },
  { key: "beneficiary", title: "Beneficiary", dataIndex: "beneficiary" },
  { key: "settlementReferenceId", title: "Settlement Ref ID", dataIndex: "settlementReferenceId" },
];

export default function AdminPaymentsPage() {
  const [data, setData] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  // Filters
  const [status, setStatus] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  useEffect(() => {
    setLoading(true);
    AdminAxios.get('/admins/payments', {
      params: {
        page,
        limit: pageSize,
        sortBy,
        sortOrder,
        status,
        type,
        dateFrom,
        dateTo,
      }
    }).then(res => {
      setData(res.data.payments);
      setTotal(res.data.total);
    }).catch(() => {
      setData([]);
      setTotal(0);
    }).finally(() => setLoading(false));
  }, [page, pageSize, sortBy, sortOrder, status, type, dateFrom, dateTo]);

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Payments</h2>
        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select value={status} onChange={e => setStatus(e.target.value)} className="px-2 py-1 rounded border">
            <option value="">All Status</option>
            <option value="success">Success</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
          <select value={type} onChange={e => setType(e.target.value)} className="px-2 py-1 rounded border">
            <option value="">All Types</option>
            <option value="workshop">Workshop</option>
            <option value="competition">Competition</option>
            <option value="event">Event</option>
            <option value="role-upgrade">Role Upgrade</option>
          </select>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="px-2 py-1 rounded border" />
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="px-2 py-1 rounded border" />
          <button onClick={() => { setStatus(""); setType(""); setDateFrom(""); setDateTo(""); }} className="px-2 py-1 rounded bg-gray-200">Reset</button>
        </div>
        <Table
          columns={columns}
          data={data}
          loading={loading}
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={(key, order) => { setSortBy(key); setSortOrder(order); }}
          rowKey="_id"
          className="mb-4"
        />
        <div className="flex items-center gap-2 mt-4">
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={setPage}
            showSizeChanger
            showQuickJumper
            showTotal={(total: number, range: [number, number]) => (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {range[0]} to {range[1]} of {total} payments
              </span>
            )}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          />
          <select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }} className="ml-2 px-2 py-1 rounded">
            {[10, 20, 50].map(size => <option key={size} value={size}>{size} / page</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
