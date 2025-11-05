import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"

import { MoreVertical , ChevronLeft, ChevronRight, Badge, Phone, Mail, Download} from "lucide-react"

import Sidebar from "../../components/admin/Sidebar"
import { getAllUsers ,updateUserStatus} from "../../services/admin/admin.service";
import  {Table, type TableColumn } from "../../components/ui/Table";
import { Switch } from "../../components/ui/Switch";
import toast from "react-hot-toast";
import { Button } from "../../components/ui/Button";
import { Pagination } from "../../components/ui/Pagination";
import Navbar from "../../components/admin/Navbar";
import ConfirmationModal from "../../components/ui/ConfirmationModal";

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
  role:string;
  profileImage?: string;
  isActive: boolean;
  isGoogleUser: boolean;
  createdAt: string;
  updatedAt: string;
}
const UserDetails: React.FC = () => {
  console.log("UserDetails page loaded")
    // const navigate = useNavigate()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState<string>("")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [updateLoading, setUpdateLoading] = useState<string | null>(null)
   const [showBlockModal, setShowBlockModal] = useState(false)
 const [selectedUser, setSelectedUser] = useState<User | null>(null)

    // const dispatch = useDispatch()
    useEffect(() => {
    fetchUsers()
  }, [])

 const fetchUsers = async (): Promise<void> => {
  setLoading(true);
  try {
    const response = await getAllUsers();
    console.log("response in fetchUsers in UserDetails.tsx",response)
    if ( response.users&& Array.isArray(response.users)) {
      const mappedUsers: User[] = response.users.map((user: any) => ({
        // _id: user.id,
        _id:user._id.toString(),
        username: user.username,
        email: user.email,
        phone: user.phone || '',
        role: Array.isArray(user.role) ? user.role[0] : user.role,
        profileImage: user.profileImage || '',
        isActive: !user.isBlocked,
        // isGoogleUser: user.isGoogleUser ?? false,
        isGoogleUser: !!user.googleId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));
      console.log("mappedUsers",mappedUsers)
      setUsers(mappedUsers);
    } else {
      console.error('Failed to fetch users - Invalid response structure:', response.message);
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    setLoading(false);
  }
};

// const handleToggleUserStatus = async (userId: string, currentStatus: boolean): Promise<void> => {
const handleToggleUserStatus = async (): Promise<void> => {
 if (!selectedUser) return;
 const userId = selectedUser._id;
 const currentStatus = selectedUser.isActive;

    if (!userId || typeof userId !== 'string' || userId.trim() === '') {
      console.error('Invalid user ID:', userId);
      toast.error('Invalid user ID. Please try again.', {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #F87171'
        }
      });
      setShowBlockModal(false);
      return;
    }
    setUpdateLoading(userId);
    try {
      const newStatus = !currentStatus;
      const response = await updateUserStatus(userId);
      if (response.success) {
        setUsers(prevUsers =>
          prevUsers.map(user =>
            user._id === userId
              ? { ...user, isActive: newStatus }
              : user
          )
        );
        // toast.success(`User ${newStatus ? 'activated' : 'blocked'} successfully!`, {
        toast.success(response.message || `User ${newStatus ? 'activated' : 'blocked'} successfully!`, {
          position: 'top-right',
          duration: 4000,
          style: {
            background: newStatus ? '#D1FAE5' : '#FEF3C7',
            color: newStatus ? '#059669' : '#D97706',
            border: `1px solid ${newStatus ? '#34D399' : '#FBBF24'}`
          }
        });
      } else {
        console.error('Failed to update user status:', response.message);
        toast.error(response.message || 'Failed to update user status.', {
          position: 'top-right',
          duration: 4000,
          style: {
            background: '#FEE2E2',
            color: '#DC2626',
            border: '1px solid #F87171'
          }
        });
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('An error occurred while updating user status.', {
        position: 'top-right',
        duration: 4000,
        style: {
          background: '#FEE2E2',
          color: '#DC2626',
          border: '1px solid #F87171'
        }
      });
    } finally {
      setUpdateLoading(null);
       setShowBlockModal(false);
 setSelectedUser(null);
    }
  };
const openBlockModal = (user: User) => {
 setSelectedUser(user);
 setShowBlockModal(true);
}
const filteredAndSortedData = useMemo(() => {
    const filtered = users.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.phone && user.phone.includes(searchTerm))
    )

    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = (a as unknown as Record<string, unknown>)[sortBy]
        const bValue = (b as unknown as Record<string, unknown>)[sortBy]

        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortOrder === "asc" ? aValue - bValue : bValue - aValue
        }

        if (typeof aValue === "boolean" && typeof bValue === "boolean") {
          return sortOrder === "asc"
            ? (aValue === bValue ? 0 : aValue ? 1 : -1)
            : (aValue === bValue ? 0 : aValue ? -1 : 1)
        }

        return 0
      })
    }

    return filtered
  }, [users, searchTerm, sortBy, sortOrder])

  // Paginate data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    return filteredAndSortedData.slice(startIndex, startIndex + pageSize)
  }, [filteredAndSortedData, currentPage, pageSize])

  // const handleLogout = async (): Promise<void> => {
  //   try {
  //     localStorage.removeItem("adminToken")
  //     sessionStorage.clear()
  //     navigate("/admin/login")
  //   } catch (error) {
  //     console.error("Logout failed:", error)
  //     navigate("/admin/login")
  //   }
  // }

  const handleSearch = (query: string): void => {
    setSearchTerm(query)
    setCurrentPage(1) 
  }

  const handleSort = (key: string, order: "asc" | "desc"): void => {
    setSortBy(key)
    setSortOrder(order)
  }
    const handlePageChange = (page: number, newPageSize?: number): void => {
    setCurrentPage(page)
    if (newPageSize) {
      setPageSize(newPageSize)
      setCurrentPage(1) 
    }
  }
  const columns: TableColumn<User>[] = [
    {
      key: "user",
      title: "User",
      dataIndex: "username",
      // sortable: true,
      render: (_value: unknown, record: User) => (
        <div className="flex items-center gap-3">
          {/* <Avatar className="h-8 sm:h-10 w-8 sm:w-10 ring-2 ring-gray-200 dark:ring-gray-600">
            <AvatarImage src={record.profileImage ? cloudinaryUtils.getFullUrl(record.profileImage) : "/placeholder.svg?height=40&width=40"} />
            <AvatarFallback className="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 text-xs sm:text-sm">
              {record.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()}
            </AvatarFallback>
          </Avatar> */}
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-100 text-sm sm:text-base">{record.username}</p>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              {record.isGoogleUser ? 'Google User' : 'Regular User'}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      title: "Contact Info",
      dataIndex: "email",
      // sortable: true,
      render: (_value: unknown, record: User) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
            <Mail className="h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
            <span className="truncate">{record.email}</span>
          </div>
          {record.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
              <Phone className="h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
              <span>{record.phone}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      key: "role",
      title: "Role",
      dataIndex: "role",
      // sortable: true,
      render: (_value: unknown, record: User) => (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
            <Mail className="h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
            <span className="truncate">{record.role}</span>
          </div>
          {/* {record.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-900 dark:text-gray-100">
              <Phone className="h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
              <span>{record.phone}</span>
            </div>
          )} */}
        </div>
      ),
    },
    {
      key: "status",
      title: "Status",
      dataIndex: "isActive",
      align: "center",
      // sortable: true,
      render: (_value: unknown, record: User) => (
        <div>
        {/* <Badge
          className={
            record.isActive
              ? "bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800 text-xs sm:text-sm"
              : "bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800 text-xs sm:text-sm"
          }
        >
        </Badge> */}
          <p className={record.isActive ? "text-green-600" : "text-red-600"}>{record.isActive ? 'Active' : 'Blocked'}</p>
          </div>
      ),
    },
    {
      key: "isActive",
      title: "Block/Unblock",
      dataIndex: "isActive",
      align: "center",
      render: (_value: unknown, record: User) => (
        <Switch
          checked={record.isActive}
          onCheckedChange={() => openBlockModal(record)}
          disabled={updateLoading === record._id}
          className="data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-red-600"
        />
      ),
    },]
    return (
        // <div className="flex h-screen bg-gray-900 text-white">
        //     <Sidebar />
        //     <div className="flex-1 flex flex-col overflow-hidden">
        //         {/* <Header /> */}
        //         <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-900 p-8">
        //             <h1 className="text-2xl font-semibold mb-6">User Management</h1>
        //             {/* Dashboard content will go here */}
        //             <div className="text-center py-20 bg-gray-800 rounded-lg">
        //                 {/* <p>Dashboard components will be built here.</p> */}
        //             </div>
        //         </main>
        //     </div>
        // </div>


        //*********************************************************************************************************************** */
//          <div className="flex h-screen bg-[#0D1117] text-white">
//  <Sidebar />
//  <div className="flex-1 flex flex-col overflow-hidden">
//  <main className="flex-1 overflow-x-hidden overflow-y-auto p-8">
//  <h1 className="text-3xl font-bold mb-8">User Management</h1>
//  <div className="bg-[#161B22] rounded-xl p-6">
//  <div className="flex justify-between items-center mb-6">
//  <h2 className="text-xl font-semibold">Users</h2>
//  <button className="text-gray-400 hover:text-white">
//  <MoreVertical size={20} />
//  </button>
//  </div>
//  </div>
//  </main>
//  </div>
//  </div>


//*********************************************************************************************** */

<div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Sidebar */}
      <Sidebar 
        // activeItem={activeMenuItem} 
        // onItemClick={handleMenuItemClick} 
        // onLogout={handleLogout} 
        // isOpen={isSidebarOpen}
        // onClose={() => setIsSidebarOpen(false)}
      />

      {/* Navbar */}
      <Navbar 
        userName="Stelishya" 
        onSearch={handleSearch} 
        // onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        // isSidebarOpen={isSidebarOpen}
      />

      {/* Main Content */}
      <main className="relative mt-16 md:ml-64 p-4 md:p-6 min-h-screen z-30">
        <div className="space-y-6 ">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                User Management
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage user information and accounts</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* <Button
                variant="outline"
                onClick={()=>({})}
                className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent text-sm w-full sm:w-auto"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button> */}
            </div>
          </div>

          {/* Stats Cards */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
                  </div>
                  <div className="p-2 md:p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <User className="h-5 md:h-6 w-5 md:w-6 text-gray-600 dark:text-gray-300" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Users</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.activeUsers}</p>
                  </div>
                  <div className="p-2 md:p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <User className="h-5 md:h-6 w-5 md:w-6 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Blocked Users</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.blockedUsers}</p>
                  </div>
                  <div className="p-2 md:p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <User className="h-5 md:h-6 w-5 md:w-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardContent className="p-4 md:p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Google Users</p>
                    <p className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.googleUsers}</p>
                  </div>
                  <div className="p-2 md:p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <User className="h-5 md:h-6 w-5 md:w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}

          {/* Filters and Search */}
          {/* <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="flex-1 relative w-full">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search customers by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 dark:focus:ring-gray-400 focus:border-transparent text-sm"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={()=>({})}
                  className="border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 bg-transparent w-full sm:w-auto text-sm"
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </CardContent>
          </Card> */}

          {/* Table */}
          <Table
            columns={columns}
            data={paginatedData}
            loading={loading}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            className="shadow-sm overflow-x-auto"
          />

          {/* Pagination */}
          <Pagination
            current={currentPage}
            total={filteredAndSortedData.length}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger
            showQuickJumper
            showTotal={(total: number, range: [number, number]) => (
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Showing {range[0]} to {range[1]} of {total} users
              </span>
            )}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
          />
        </div>
      </main>

      {/* Footer */}
      {/* <div className="md:ml-64">
        <Footer />
      </div> */}
      <ConfirmationModal
    show={showBlockModal}
    onClose={() => {
        setShowBlockModal(false);
        setSelectedUser(null);
    }}
    onConfirm={handleToggleUserStatus}
    title={selectedUser?.isActive ? "Block User" : "Unblock User"}
    message={
        selectedUser?.isActive
            ? `Are you sure you want to block ${selectedUser?.username}?...`
            : `Are you sure you want to unblock ${selectedUser?.username}?...`
    }
    confirmText={selectedUser?.isActive ? "Block User" : "Unblock User"}
    variant={selectedUser?.isActive ? "danger" : "info"}
    isLoading={updateLoading === selectedUser?._id}
/>
    </div>
    )
}
export default UserDetails;