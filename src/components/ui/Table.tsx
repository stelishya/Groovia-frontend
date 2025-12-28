import type { ReactNode } from "react"
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

export interface TableColumn<T = any> {
  key: string
  title: string
  dataIndex: string
  width?: string
  sortable?: boolean
  render?: (value: any, record: T, index: number) => ReactNode
  align?: "left" | "center" | "right"
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[]
  data: T[]
  loading?: boolean
  className?: string
  rowKey?: string | ((record: T) => string)
  onRowClick?: (record: T, index: number) => void
  sortBy?: string
  sortOrder?: "asc" | "desc"
  onSort?: (key: string, order: "asc" | "desc") => void
  emptyText?: string
}

export function Table<T = any>({
  columns,
  data,
  loading = false,
  className = "",
  rowKey = "id",
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
  emptyText = "No data available",
}: TableProps<T>) {
  const getRowKey = (record: T, index: number): string => {
    if (typeof rowKey === "function") {
      return rowKey(record)
    }
    return (record as any)[rowKey] || index.toString()
  }

  const handleSort = (columnKey: string) => {
    if (!onSort) return

    let newOrder: "asc" | "desc" = "asc"
    if (sortBy === columnKey && sortOrder === "asc") {
      newOrder = "desc"
    }
    onSort(columnKey, newOrder)
  }

  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) {
      return <ChevronsUpDown className="h-4 w-4 text-gray-400" />
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 text-gray-600 dark:text-gray-300" />
    ) : (
      <ChevronDown className="h-4 w-4 text-gray-600 dark:text-gray-300" />
    )
  }

  if (loading) {
    return (
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 ${className}`}
      >
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-300 mx-auto"></div>
          <p className="mt-4 text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider ${column.width ? `w-${column.width}` : ""
                    } ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""}`}
                >
                  {column.sortable ? (
                    <button
                      onClick={() => handleSort(column.dataIndex)}
                      className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      {column.title}
                      {renderSortIcon(column.dataIndex)}
                    </button>
                  ) : (
                    column.title
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${onRowClick ? "cursor-pointer" : ""
                    }`}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {columns.map((column) => {
                    const value = (record as any)[column.dataIndex]
                    const content = column.render ? column.render(value, record, index) : value

                    return (
                      <td
                        key={column.key}
                        className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 ${column.align === "center" ? "text-center" : column.align === "right" ? "text-right" : ""
                          }`}
                      >
                        {content}
                      </td>
                    )
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

import { Edit, Trash, RefreshCcw } from "lucide-react";

export interface UserTableProps {
  data: any[];
  variant: 'organizer-competition' | 'dancer-competition' | 'dancer-workshop' | 'payments';
  currentUserId?: string;
  onView?: (item: any) => void;
  onEdit?: (item: any) => void;
  onDelete?: (item: any) => void;
  onViewParticipants?: (item: any) => void;
  onRetryPayment?: (item: any) => void;
  onJoinSession?: (item: any) => void;
  activeRoomId?: string | null;
}

export function UserTable({
  data,
  variant,
  currentUserId,
  onView,
  onEdit,
  onDelete,
  onViewParticipants,
  onRetryPayment,
  onJoinSession,
  activeRoomId
}: UserTableProps) {

  const getImageUrl = (imageKey: string) => {
    if (!imageKey) return '/placeholder-competition.jpg';
    if (imageKey.startsWith('http')) return imageKey;
    return imageKey;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active": return "bg-green-500/20 text-green-400 border border-green-500/30";
      case "closed": return "bg-red-500/20 text-red-400 border border-red-500/30";
      case "completed": return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
      case "upcoming": return "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-400 border border-gray-500/30";
    }
  };

  // Helper to get payment status based on variant
  const getPaymentStatus = (item: any) => {
    if (variant === 'dancer-workshop') {
      return item.userParticipant?.paymentStatus;
    }
    // For competitions
    if (item.registeredDancers && currentUserId) {
      const registration = item.registeredDancers.find(
        (d: any) => (d.dancerId?._id || d.dancerId) === currentUserId
      );
      return registration?.paymentStatus;
    }
    if (variant === 'payments') {
      return item.status;
    }
    return null;
  };

  // Helper to extract display data (handling snapshots for workshops)
  const getDisplayData = (item: any) => {
    if (variant === 'dancer-workshop') {
      const snapshot = item.userParticipant?.snapshot;
      const isOnline = item.mode === 'online';
      return {
        id: item._id,
        image: snapshot?.image || item.posterImage,
        title: snapshot?.title || item.title,
        style: item.style,
        level: item.level || 'All Levels',
        date: snapshot?.date ? new Date(snapshot.date) : new Date(item.startDate),
        duration: item.duration || (snapshot?.time ? snapshot.time : null),
        location: snapshot?.location || (isOnline ? 'Online' : item.location),
        isOnline: snapshot?.location ? snapshot.location === 'Online' : isOnline,
        fee: snapshot?.fee !== undefined ? snapshot.fee : item.fee,
        status: item.status || 'upcoming',
        participantsCount: item.participants?.length || 0,
        maxParticipants: item.maxParticipants,
        sessions: item.sessions
      };
    }

    if (variant === 'payments') {
      return {
        id: item._id,
        title: item.description,
        type: item.paymentType,
        amount: item.amount,
        status: item.status,
        date: new Date(item.createdAt),
        transactionId: item.transactionId,
        orderId: item.orderId
      };
    }

    // Competitions
    const isOnline = item.mode === 'online';
    return {
      id: item._id,
      image: item.posterImage,
      title: item.title,
      style: item.style,
      level: item.level,
      date: new Date(item.date),
      duration: item.duration,
      location: isOnline ? 'Online' : item.location,
      isOnline,
      fee: item.fee,
      status: item.status,
      participantsCount: item.registeredDancers?.filter((d: any) => d.paymentStatus === 'paid').length || 0,
      maxParticipants: item.maxParticipants
    };
  };

  return (
    <div className="bg-purple-800/30 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-purple-900/50 border-b border-purple-700">
            <tr>
              {variant === 'payments' ? (
                <>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Event/Item Name
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Transaction ID
                  </th>
                </>
              ) : (
                <>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    {variant.includes('workshop') ? 'Workshop' : 'Competition'}
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Location
                  </th>
                  {variant === 'organizer-competition' && (
                    <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      Participants
                    </th>
                  )}
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Fee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    View
                  </th>
                  {variant === 'organizer-competition' && (
                    <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                  {variant !== 'organizer-competition' && (
                    <th className="px-6 py-4 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      Payment
                    </th>
                  )}
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-purple-800/20 divide-y divide-purple-700">
            {data.map((item) => {
              const display = getDisplayData(item);
              const paymentStatus = getPaymentStatus(item);

              return (
                <tr
                  key={item._id}
                  className="hover:bg-purple-700/30 transition-colors"
                >
                  {variant === 'payments' ? (
                    <>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-white text-left">
                          {display.title}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 bg-purple-600/50 text-purple-200 text-xs rounded-full">
                          {display.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm text-white">
                        {display.date.toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-semibold text-white">
                        ₹{display.amount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${paymentStatus === 'success' || paymentStatus === 'paid'
                          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                          : paymentStatus === 'failed'
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                          }`}>
                          {paymentStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-left text-xs text-purple-300 italic">
                        {display.transactionId || 'N/A'}
                      </td>
                    </>
                  ) : (
                    <>
                      {/* Info with Image */}
                      <td className="px-6 py-4">
                        <div className="flex items-left gap-3">
                          <img
                            src={getImageUrl(display.image)}
                            alt={display.title}
                            className="w-12 h-12 rounded-lg object-cover border-2 border-purple-500"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-competition.jpg';
                            }}
                          />
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-white truncate max-w-xs">
                              {display.title}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="px-2 py-0.5 bg-purple-600/50 text-purple-200 text-xs rounded-full">
                                {display.style}
                              </span>
                              {display.level && variant !== 'dancer-workshop' && (
                                <span className="px-2 py-0.5 bg-purple-600/50 text-purple-200 text-xs rounded-full">
                                  {display.level}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <div className="text-sm text-white">
                          {display.date.toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        {display.duration && (
                          <div className="text-xs text-purple-300">
                            {display.duration}
                          </div>
                        )}
                      </td>

                      {/* Location */}
                      <td className="px-6 py-4">
                        <div className="text-sm text-white max-w-xs truncate text-left">
                          {display.isOnline && (
                            <span className="text-purple-300">🌐 Online</span>
                          )}
                          {!display.isOnline && (
                            <span>{display.location?.substring(0, 20) || 'TBA'}</span>
                          )}

                          {/* Join Session (Dancer Only) */}
                          {variant === 'dancer-workshop' &&
                            onJoinSession &&
                            (
                              <div className="mt-2">
                                {(display.status?.toLowerCase() === 'active' || display.status?.toLowerCase() === 'live') && paymentStatus === 'paid' ? (
                                  <button
                                    onClick={() => {
                                      if (item._id === activeRoomId) return;
                                      onJoinSession(item);
                                    }}
                                    disabled={item._id === activeRoomId}
                                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-1 shadow-md w-fit ${item._id === activeRoomId
                                      ? 'bg-purple-900/50 text-purple-300 border border-purple-500/50 cursor-default animate-none'
                                      : 'bg-red-600 text-white hover:bg-red-700 animate-pulse'
                                      }`}
                                  >
                                    {item._id === activeRoomId ? 'In Video Call 🎥' : 'Join now 🎥'}
                                  </button>
                                ) : null}
                              </div>
                            )}
                        </div>
                      </td>

                      {/* Participants (Organizer Only) */}
                      {variant === 'organizer-competition' && (
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col gap-2 text-left">
                            <div className="text-sm text-white">
                              {display.participantsCount} / {display.maxParticipants}
                            </div>
                            <div className="w-full bg-purple-900 rounded-full h-1.5 mt-1">
                              <div
                                className="bg-purple-500 h-1.5 rounded-full"
                                style={{
                                  width: `${(display.participantsCount / display.maxParticipants) * 100}%`
                                }}
                              />
                            </div>
                            <button
                              onClick={() => onViewParticipants?.(item._id)}
                              className="text-xs text-purple-300 hover:text-white hover:underline self-start"
                            >
                              View List
                            </button>
                          </div>
                        </td>
                      )}

                      {/* Fee */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-white text-left">
                          ₹{display.fee}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 whitespace-nowrap text-left">
                        <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(display.status)}`}>
                          {display.status}
                        </span>
                        {paymentStatus && (
                          <div className="mt-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${paymentStatus === 'paid'
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : paymentStatus === 'failed'
                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              }`}>
                              {paymentStatus}
                            </span>
                          </div>
                        )}
                      </td>

                      {/* View */}
                      <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                        <button
                          onClick={() => onView?.(item)}
                          className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 transition-colors"
                        >
                          View
                        </button>
                      </td>

                      {/* Actions (Organizer Only) */}
                      {variant === 'organizer-competition' && (
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div className="flex justify-left gap-2">
                            <button
                              onClick={() => onEdit?.(item)}
                              className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors flex items-center gap-1"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => onDelete?.(item)}
                              className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs hover:bg-red-700 transition-colors flex items-center gap-1"
                            >
                              <Trash size={14} />
                            </button>
                          </div>
                        </td>
                      )}

                      {/* Payment (Dancer Only) */}
                      {variant !== 'organizer-competition' && (
                        <td className="px-6 py-4 whitespace-nowrap text-left">
                          <div>
                            {paymentStatus === 'failed' ? (
                              <button
                                onClick={() => onRetryPayment?.(item)}
                                className="px-3 py-1.5 bg-orange-600 text-white rounded-lg text-xs hover:bg-orange-700 transition-colors flex items-center gap-1 mx-auto"
                              >
                                <RefreshCcw size={14} /> Retry
                              </button>
                            ) : (
                              <span className="text-green-400 text-xs text-left block">{(paymentStatus?.toString() || 'PAID').toUpperCase()}</span>
                            )}
                          </div>
                        </td>
                      )}
                    </>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}