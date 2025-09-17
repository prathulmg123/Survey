import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Eye, FileText, Users, X, Plus, ChevronLeft, ChevronRight, Search, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { useLoader } from "@/hooks/useLoader";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Portal } from "@/components/ui/Portal";

// Mock data - in a real app, this would come from an API
const mockSurveys = [
  {
    id: 1,
    title: "Employee Satisfaction Survey 2023",
    description: "Annual survey to measure employee satisfaction and engagement",
    status: "active",
    responses: 42,
    questions: 15,
    createdAt: "2023-09-01",
    updatedAt: "2023-09-10",
  },
  {
    id: 2,
    title: "Product Feedback Q3",
    description: "Gather feedback on our latest product features",
    status: "draft",
    responses: 0,
    questions: 8,
    createdAt: "2023-08-15",
    updatedAt: "2023-08-20",
  },
  {
    id: 3,
    title: "Customer Satisfaction",
    description: "Measure overall customer satisfaction with our services",
    status: "completed",
    responses: 128,
    questions: 10,
    createdAt: "2023-07-10",
    updatedAt: "2023-08-31",
  },
];

interface Survey {
  id: number;
  title: string;
  description: string;
  status: string;
  responses: number;
  questions: number;
  createdAt: string;
  updatedAt: string;
}

export default function ManageSurveys() {
  const [searchTerm, setSearchTerm] = useState("");
  const [surveys, setSurveys] = useState<Survey[]>(mockSurveys);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isDeleteModalOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isDeleteModalOpen]);

  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<keyof Survey>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      hideLoader();
    }, 500);

    return () => {
      clearTimeout(timer);
      hideLoader();
    };
  }, [showLoader, hideLoader]);

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader text="Loading..." show={true} size={52} />
        </div>
      </div>
    );
  }

  // Sort function
  const sortSurveys = (surveysToSort: Survey[]) => {
    return [...surveysToSort].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      // Handle different data types for sorting
      if (sortField === 'createdAt' || sortField === 'updatedAt') {
        aValue = new Date(a[sortField]).getTime() as any;
        bValue = new Date(b[sortField]).getTime() as any;
      } else if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
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
  const handleSort = (field: keyof Survey) => {
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
  const getSortIcon = (field: keyof Survey) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-3 w-3 inline-block" /> 
      : <ArrowDown className="ml-1 h-3 w-3 inline-block" />;
  };

  // Filter and sort surveys
  const filteredSurveys = surveys.filter(
    (survey) =>
      survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      survey.status.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const sortedSurveys = sortSurveys(filteredSurveys);

  // Pagination logic
  const totalItems = sortedSurveys.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = sortedSurveys.slice(startIndex, endIndex);

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleDeleteClick = (survey: Survey) => {
    setSurveyToDelete(survey);
    setIsDeleteModalOpen(true);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleteModalOpen(false);
    // Don't clear surveyToDelete immediately to avoid animation flicker
    setTimeout(() => setSurveyToDelete(null), 200);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (surveyToDelete) {
      console.log("Deleting survey:", surveyToDelete.id);
      setSurveys(prev => prev.filter(s => s.id !== surveyToDelete.id));
      setIsDeleteModalOpen(false);
      // Don't clear surveyToDelete immediately to avoid animation flicker
      setTimeout(() => setSurveyToDelete(null), 200);
    }
  };

  const handleViewClick = (survey: Survey) => {
    navigate(`/surveys/view/${survey.id}`);
  };

  const handleEditClick = (survey: Survey) => {
    navigate(`/surveys/${survey.id}`);
  };



  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Active</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "completed":
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">

      {/* Delete Confirmation Modal */}
      <Portal>
        {isDeleteModalOpen && surveyToDelete && (
          <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={cancelDelete}
          >
            <div 
              className="w-full max-w-md bg-background rounded-lg shadow-xl border border-border/50 overflow-hidden animate-in fade-in-75 zoom-in-95"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-destructive/10">
                    <Trash2 className="h-6 w-6 text-destructive" />
                  </div>
                  <h2 className="text-xl font-semibold">Delete Survey</h2>
                </div>

                <p className="text-muted-foreground">
                  Are you sure you want to delete?
                </p>

                <div className="flex justify-end gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={cancelDelete}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                  >
                    Delete Survey
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Portal>


<div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">Manage Survey</h2>
          
          <p className="text-muted-foreground text-base text-sm mt-2">
            Overview of your survey management
          </p>
        </div>
      </div>

      <Card>
        <CardContent>
          <div className="mb-4 flex justify-end mt-4">
            <div className="relative w-50 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 z-10" />
              <Input
                type="search"
                placeholder="Search Survey..."
                className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 transition-colors duration-200"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page when searching
                }}
              />
            </div>
          </div>

          <div className="relative rounded-lg border border-gray-200 overflow-hidden mb-6 group shadow-md hover:shadow-lg transition-shadow duration-200 border-2 border-blue-100">
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-blue-50/50 to-transparent opacity-70 rounded-b-lg pointer-events-none"></div>
            <div className="relative bg-white rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-blue-600/90">
                  <TableRow className="hover:bg-transparent">
                    <TableHead 
                      className="text-white/95 font-medium py-3 px-4 text-left cursor-pointer hover:bg-blue-700/80 transition-colors"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center">
                        Survey
                        {getSortIcon('title')}
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
                      className="text-white/95 font-medium py-3 px-4 text-left cursor-pointer hover:bg-blue-700/80 transition-colors"
                      onClick={() => handleSort('responses')}
                    >
                      <div className="flex items-center">
                        Responses
                        {getSortIcon('responses')}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="text-white/95 font-medium py-3 px-4 text-left cursor-pointer hover:bg-blue-700/80 transition-colors"
                      onClick={() => handleSort('createdAt')}
                    >
                      <div className="flex items-center">
                        Created
                        {getSortIcon('createdAt')}
                      </div>
                    </TableHead>
                    <TableHead className="text-white/95 font-medium py-3 px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white">
                  {currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-12 w-12 text-gray-300 mb-2" />
                          <p className="text-gray-500">No surveys found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentItems.map((survey) => (
                      <TableRow key={survey.id} className="hover:bg-gray-50">
                        <TableCell className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">{survey.title}</div>
                              <div className="text-sm text-gray-500">{survey.description}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          <Badge
                            variant="outline"
                            className={`${survey.status === 'active'
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : survey.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              }`}
                          >
                            {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="px-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span>{survey.responses} {survey.responses === 1 ? 'response' : 'responses'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-4">
                          {new Date(survey.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleViewClick(survey)}
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="sr-only">View</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View Survey</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  onClick={() => handleEditClick(survey)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Edit</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit Survey</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                  onClick={() => handleDeleteClick(survey)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete Survey</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>


              {/* Pagination */}
              {totalItems > 0 && (
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t bg-gray-50">
                  <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                    Showing <span className="font-medium">{startIndex + 1}</span> to{' '}
                    <span className="font-medium">{Math.min(endIndex, totalItems)}</span> of{' '}
                    <span className="font-medium">{totalItems}</span> results
                  </div>

                  <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Rows per page:</span>
                      <div className="w-24 [&_button]:border-0 [&_button]:ring-1 [&_button]:ring-gray-300 [&_button]:ring-offset-0">
                      <Select
                        value={itemsPerPage.toString()}
                        onValueChange={(value) => handleItemsPerPageChange({ target: { value }as any }as any)}
                      >
                        <SelectTrigger className="w-full h-8 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0">
                          <SelectValue placeholder={itemsPerPage.toString()} />
                        </SelectTrigger>
                        <SelectContent className="min-w-[var(--radix-select-trigger-width)] w-[var(--radix-select-trigger-width)]">
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronsLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                                ? 'bg-blue-600/90 hover:bg-blue-600/90 text-white'
                                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                              }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="p-1 rounded-md border border-gray-300 bg-white text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
    </div>
  );



  /* Delete Confirmation Modal */
  {
    isDeleteModalOpen && surveyToDelete && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md bg-background rounded-lg shadow-lg border">
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <Trash2 className="h-6 w-6 text-destructive" />
              </div>
              <h2 className="text-xl font-semibold">Delete Survey</h2>
            </div>

            <p className="text-muted-foreground">
              Are you sure you want to delete <span className="font-medium text-foreground">{surveyToDelete.title}</span>?
            </p>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={cancelDelete}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                Delete Survey
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
