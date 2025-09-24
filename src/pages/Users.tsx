import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/Loader";
import { useLoader } from "@/hooks/useLoader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, FileText,UserPlus, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, AlertCircle, Grid, List, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getUsers, User } from "@/api/userService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type SortDirection = 'asc' | 'desc';
type SortableField = 'name' | 'email' | 'role' | 'status' | 'lastActive';

interface UserWithId extends User {
  id: string;
  name: string;
  status: string;
  lastActive: string;
  role: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserWithId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [sortField, setSortField] = useState<SortableField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  // Load view mode from localStorage or default to 'table'
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');

  // Save view mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('usersViewMode', viewMode);
    }
  }, [viewMode]);
  const { showLoader, hideLoader } = useLoader();

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getUsers();
      if (response.success) {
        // Map API users to include an id field for table compatibility
        const usersWithId = response.data.users.map(user => ({
          ...user,
          id: user._id,
          name: user.full_name,
          status: user.is_active ? 'active' : 'inactive',
          lastActive: user.last_login,
          role: user.role || 'User' // Default role if not specified
        }));
        setUsers(usersWithId);
      } else {
        setError(response.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      // setError('An error occurred while fetching users');
    } finally {
      setIsLoading(false);
      hideLoader();
    }
  }, [hideLoader]);

  useEffect(() => {
    fetchUsers();
  }, []);

  if (isLoading && users.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader text="Loading users..." show={true} size={52} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <Button
              variant="outline"
              className="mt-2"
              onClick={fetchUsers}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Sort function
  const sortUsers = (users: UserWithId[]) => {
    return [...users].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      // Handle different data types for sorting
      if (sortField === 'lastActive') {
        aValue = new Date(a.last_login).getTime();
        bValue = new Date(b.last_login).getTime();
      } else if (sortField === 'status') {
        aValue = a.is_active ? 'active' : 'inactive';
        bValue = b.is_active ? 'active' : 'inactive';
      } else if (sortField === 'name') {
        aValue = a.full_name.toLowerCase();
        bValue = b.full_name.toLowerCase();
      } else if (sortField === 'role') {
        aValue = a.role || '';
        bValue = b.role || '';
      } else {
        aValue = String((a as any)[sortField] || '').toLowerCase();
        bValue = String((b as any)[sortField] || '').toLowerCase();
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });
  };

  // Handle sort click
  const handleSort = (field: SortableField) => {
    if (sortField === field) {
      // Toggle sort direction if clicking the same field
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when changing sort
  };

  // Get sort icon for a column
  const getSortIcon = (field: SortableField) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />;
    return sortDirection === 'asc'
      ? <ArrowUp className="ml-1 h-3 w-3 inline-block" />
      : <ArrowDown className="ml-1 h-3 w-3 inline-block" />;
  };

  // Filter and sort users
  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortedUsers = sortUsers(filteredUsers);

  // Pagination logic
  const totalItems = filteredUsers.length;
  
  // Use 8 items per page for grid view, current itemsPerPage for table view
  const gridItemsPerPage = 8;
  const effectiveItemsPerPage = viewMode === 'grid' ? gridItemsPerPage : itemsPerPage;
  
  const totalPages = Math.ceil(totalItems / effectiveItemsPerPage);
  const startIndex = (currentPage - 1) * effectiveItemsPerPage;
  const endIndex = Math.min(startIndex + effectiveItemsPerPage, totalItems);
  const currentItems = sortedUsers.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };



  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">Users</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Here's an overview of your survey platform users and their activities.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'table' ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 ${viewMode === 'table' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : ''}`}
          >
            <List className="h-4 w-4" />
            <span>Table</span>
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'outline' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 ${viewMode === 'grid' ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800' : ''}`}
          >
            <Grid className="h-4 w-4" />
            <span>Grid</span>
          </Button>
        </div>
      </div>
      {viewMode == 'grid' && (
       <div className="w-full">
       {/* Search */}
       <div className="mb-6 flex justify-end">
         <div className="relative w-full max-w-sm">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
           <Input
             type="search"
             placeholder="Search users..."
             className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
             value={searchTerm}
             onChange={(e) => {
               setSearchTerm(e.target.value);
               setCurrentPage(1);
             }}
           />
         </div>
       </div>

       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">


         {currentItems.length === 0 ? (
                   <div className="col-span-full flex flex-col items-center justify-center py-12 mt-12">
                     <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                     <p className="text-gray-500 dark:text-gray-400 text-lg">No Users found</p>
                   </div>
                 ) : (currentItems.map((user) => (
           <div
             key={user.id}
             className="border-blue-300 dark:border-blue-500 relative group bg-white dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full hover:border-blue-300 dark:hover:border-blue-500 hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-900/40 w-full max-w-[400px]"
           >
             {/* Subtle gradient overlay on hover */}
             <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-50/30 dark:to-blue-900/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
             
             {/* Status */}
             <div
               className={`absolute top-4 right-4 w-3 h-3 rounded-full ${
                 user.is_active ? "bg-green-400" : "bg-gray-400"
               } ring-2 ring-white dark:ring-gray-900 z-10`}
             ></div>
 
             <div className="p-6 flex-1 relative z-10">
               {/* Profile */}
               <div className="flex items-center space-x-4 pb-4 mb-4 border-b border-gray-100 dark:border-gray-700/50">
                 <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xl font-semibold shadow-inner border-2 border-white/20">
                   {user.full_name.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex-1 min-w-0">
                   <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                     {user.full_name}
                   </h3>
                   <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                     @{user.username}
                   </p>
                 </div>
               </div>
 
               {/* Email + Role */}
               <div className="space-y-4">
                 <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                   <Mail className="h-4 w-4 text-blue-400 mr-2 flex-shrink-0" />
                   <a
                     href={`mailto:${user.email}`}
                     className="hover:underline truncate hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                   >
                     {user.email}
                   </a>
                 </div>
 
                 <div className="flex justify-between items-center">
                   <span
                     className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium shadow-sm ${
                       user.role === "Admin"
                         ? "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300"
                         : user.role === "User"
                         ? "bg-sky-100 text-sky-700 dark:bg-sky-900/60 dark:text-sky-300"
                         : "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300"
                     }`}
                   >
                     {user.role}
                   </span>
                 </div>
 
                 {/* Last Active */}
                 <div className="pt-3 mt-3 border-t border-gray-100 dark:border-gray-700/50 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                   <span>Last active</span>
                   <span className="font-medium">
                     {new Date(user.last_login).toLocaleDateString("en-US", {
                       month: "short",
                       day: "numeric",
                       year: 'numeric'
                     })}
                   </span>
                 </div>
               </div>
             </div>
           </div>
         )))}
       </div>
 
       {/* Pagination */}
       {totalItems > 0 && (
         <div className="mt-6 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-6 py-4 flex flex-col sm:flex-row items-center justify-between">
           <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
             Showing <span className="font-medium">{startIndex + 1}</span> to{" "}
             <span className="font-medium">{Math.min(endIndex, totalItems)}</span>{" "}
             of <span className="font-medium">{totalItems}</span> results
           </div>
 
           <div className="flex items-center space-x-3">
          
 
             {/* Page controls */}
             <div className="flex items-center space-x-1">
               <button
                 onClick={() => goToPage(1)}
                 disabled={currentPage === 1}
                 className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
               >
                 <ChevronsLeft className="h-4 w-4" />
               </button>
               <button
                 onClick={() => goToPage(currentPage - 1)}
                 disabled={currentPage === 1}
                 className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
               >
                 <ChevronLeft className="h-4 w-4" />
               </button>
 
               {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                 let pageNum;
                 if (totalPages <= 5) {
                   pageNum = i + 1;
                 } else if (currentPage <= 3) {
                   pageNum = i + 1;
                 } else if (currentPage >= totalPages - 2) {
                   pageNum = totalPages - 4 + i;
                 } else {
                   pageNum = currentPage - 2 + i;
                 }
 
                 return (
                   <button
                     key={pageNum}
                     onClick={() => goToPage(pageNum)}
                     className={`w-9 h-9 flex items-center justify-center rounded-full text-sm font-medium transition-colors ${
                       currentPage === pageNum
                         ? "bg-blue-600 text-white shadow-md"
                         : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                     }`}
                   >
                     {pageNum}
                   </button>
                 );
               })}
 
               <button
                 onClick={() => goToPage(currentPage + 1)}
                 disabled={currentPage === totalPages}
                 className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
               >
                 <ChevronRight className="h-4 w-4" />
               </button>
               <button
                 onClick={() => goToPage(totalPages)}
                 disabled={currentPage === totalPages}
                 className="w-9 h-9 flex items-center justify-center rounded-full border border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
               >
                 <ChevronsRight className="h-4 w-4" />
               </button>
             </div>
           </div>
         </div>
       )}
     </div>

      )}
       {viewMode === 'table' && (
      <Card>
        <CardContent >
          {viewMode === 'table' && (
            <div className="mb-4 flex justify-end mt-4">
              <div className="relative w-50 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 z-10" />
                <Input
                  type="search"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 transition-colors duration-200"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1); // Reset to first page when searching
                  }}
                />
              </div>
            </div>
          )}
         
            <div className="relative rounded-lg border-2 border-blue-100 dark:border-gray-700 overflow-hidden mb-6 group shadow-md transition-shadow duration-200">
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-blue-50/50 to-transparent dark:from-gray-800/50 dark:to-transparent opacity-70 rounded-b-lg pointer-events-none"></div>
              <div className="relative bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-blue-700/90 dark:bg-blue-900/80">
                    <TableRow className="hover:bg-transparent">
                      <TableHead
                        className="text-white/95 font-medium py-3 px-4 text-left cursor-pointer hover:bg-blue-700/80 dark:hover:bg-blue-800/90 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center">
                          Name
                          {getSortIcon('name')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-white/95 font-medium py-3 px-4 text-left cursor-pointer hover:bg-blue-700/80 transition-colors"
                        onClick={() => handleSort('email')}
                      >
                        <div className="flex items-center">
                          Email
                          {getSortIcon('email')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-white/95 font-medium py-3 px-4 text-left cursor-pointer hover:bg-blue-700/80 transition-colors"
                        onClick={() => handleSort('role')}
                      >
                        <div className="flex items-center">
                          Role
                          {getSortIcon('role')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-white/95 font-medium py-3 px-4 text-left cursor-pointer hover:bg-blue-700/80 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {getSortIcon('status')}
                        </div>
                      </TableHead>
                      <TableHead
                        className="text-white/95 font-medium py-3 px-4 text-right cursor-pointer hover:bg-blue-700/80 transition-colors"
                        onClick={() => handleSort('lastActive')}
                      >
                        <div className="flex items-center justify-end">
                          Last Active
                          {getSortIcon('lastActive')}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white dark:bg-gray-800/30">
                    {currentItems.length > 0 ? (
                      currentItems.map((user) => (
                        <TableRow key={user.id} className="border-b border-gray-100 dark:border-gray-700">
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-blue-600">
                                  {user.full_name.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-800 dark:text-gray-200">{user.full_name}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">@{user.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4">
                            <a href={`mailto:${user.email}`} className="text-blue-600 hover:underline dark:text-blue-400">
                              {user.email}
                            </a>
                          </TableCell>
                          <TableCell className="px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${user.role === 'Admin'
                                ? 'bg-blue-500/20 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300'
                                : user.role === 'User'
                                  ? 'bg-sky-500/20 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                                  : 'bg-purple-500/20 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                              }`}>
                              {user.role}
                            </span>
                          </TableCell>
                          <TableCell className="px-4">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${user.is_active
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                              }`}>
                              {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-gray-600 dark:text-gray-300 px-4">
                            <div className="flex flex-col items-end">
                              <span className="font-medium">
                                {new Date(user.last_login).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(user.last_login).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-24 text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                          <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                            <p className="text-gray-500">No users found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
                {/* Pagination */}
                {totalItems > 0 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700">
                    <div className="text-sm text-gray-600 dark:text-gray-300 mb-4 sm:mb-0">
                      Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                      <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
                      <span className="font-medium">{totalItems}</span> results
                    </div>

                    <div className="flex items-center space-x-2">
                      {viewMode === 'table' && (
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600 dark:text-gray-300">Rows per page:</span>
                          <div className="w-24">
                            <Select
                              value={itemsPerPage.toString()}
                              onValueChange={(value) => setItemsPerPage(Number(value))}
                            >
                              <SelectTrigger className="w-full h-8 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0">
                                <SelectValue placeholder={itemsPerPage.toString()} />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => goToPage(1)}
                          disabled={currentPage === 1}
                          className="p-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronsLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => goToPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="p-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>

                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }

                          return (
                            <button
                              key={pageNum}
                              onClick={() => goToPage(pageNum)}
                              className={`w-8 h-8 rounded-md text-sm ${currentPage === pageNum
                                  ? 'bg-blue-700/90 hover:bg-blue-700/90 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
                                  : 'border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                                }`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}

                        <button
                          onClick={() => goToPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="p-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => goToPage(totalPages)}
                          disabled={currentPage === totalPages}
                          className="p-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronsRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
        

          
        </CardContent>
      </Card>
    )}
    </div>
  );
}
