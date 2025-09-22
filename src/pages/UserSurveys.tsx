import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Search, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Grid, List, Play, CheckCircle } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getUserSurveys, SurveyResponse } from "@/api/surveyService";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Survey {
  id: string;
  _id: string;
  title: string;
  description: string;
  status: string;
  responses: number;
  questions: number;
  createdAt: string;
  updatedAt: string;
  created_at: string;
}

export default function UserSurveys() {
  const [searchTerm, setSearchTerm] = useState("");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Survey>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const navigate = useNavigate();

  // Fetch surveys from API
  const fetchSurveys = useCallback(async () => {
    try {
      setError(null);
      const response = await getUserSurveys();
      if (response.success) {
        // Map the session data to the expected survey format
        const mappedSurveys = response.data.sessions.map((session) => ({
          id: session._id,
          _id: session._id,
          title: session.human_readable_id,
          description: '',
          status: session.status.toLowerCase(),
          createdAt: session.created_at,
          updatedAt: session.created_at,
          responses: 0,
          questions: 0,
          created_at: session.created_at // Add this to match the Survey interface
        }));
        setSurveys(mappedSurveys);
      } else {
        setError(response.message || 'Failed to fetch surveys');
      }
    } catch (err) {
      console.error('Error fetching surveys:', err);
      setError('Failed to load surveys. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, []);

  // Sort function
  const sortSurveys = (surveysToSort: Survey[]) => {
    return [...surveysToSort].sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

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
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  // Get sort icon for a column
  const getSortIcon = (field: keyof Survey) => {
    if (sortField !== field) return <ArrowUpDown className="ml-1 h-3 w-3 inline-block opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="ml-1 h-3 w-3 inline-block" /> 
      : <ArrowDown className="ml-1 h-3 w-3 inline-block" />;
  };

  // Filter and sort surveys
  const filteredSurveys = surveys.filter((survey) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (survey.title?.toLowerCase() || '').includes(searchLower) ||
      (survey.description?.toLowerCase() || '').includes(searchLower) ||
      (survey.status?.toLowerCase() || '').includes(searchLower)
    );
  });
  
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

  const handleStartSurvey = (survey: Survey) => {
    navigate(`/surveys/view/${survey._id}`);
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">Draft</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">Completed</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">Error</Badge>;
      case "in_progress":
        return <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-200 capitalize">{status.toLowerCase().replace('_', ' ')}</Badge>;
    }
  };

  if (isLoading && surveys.length === 0) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader text="Loading surveys..." show={true} size={52} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button 
            onClick={fetchSurveys}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
          >
            <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <title>Close</title>
              <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
            </svg>
          </button>
          <div className="mt-2">
            <button
              onClick={fetchSurveys}
              className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold py-1 px-3 rounded"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">Available Surveys</h2>
          <p className="text-muted-foreground text-sm mt-1">
            List of surveys available for you to complete
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            <Button
              variant={viewMode === 'table' ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 ${viewMode === 'table' ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600' : ''}`}
            >
              <List className="h-4 w-4" />
              <span>Table</span>
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'outline' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className={`flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600' : ''}`}
            >
              <Grid className="h-4 w-4" />
              <span>Grid</span>
            </Button>
          </div>
        </div>
      </div>

      {viewMode === 'grid' ? (
        <div className="w-full">
          {/* Search */}
          <div className="mb-6 flex justify-end">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-500" />
              <Input
                type="search"
                placeholder="Search surveys..."
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {currentItems.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">No surveys found</p>
              </div>
            ) : (
              currentItems.map((survey) => (
                <div
                  key={survey.id}
                  onClick={() => handleStartSurvey(survey)}
                  className="group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-md rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col h-full cursor-pointer hover:ring-2 hover:ring-blue-500/20"
                >
                  <div className="absolute top-4 right-4">
                    {getStatusBadge(survey.status)}
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                        <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                        {survey.title || 'Untitled Survey'}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                        {survey.description || 'No description'}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(survey.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div className="flex items-center">
                        {survey.status === 'completed' ? (
                          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all transform hover:scale-105 flex items-center gap-1.5">
                            <CheckCircle className="h-4 w-4 text-white" strokeWidth={2.5} />
                            <span>View Results</span>
                          </div>
                        ) : (
                          <div className="px-3 py-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-sm font-medium shadow-sm hover:shadow-md transition-all transform hover:scale-105 flex items-center gap-1.5">
                            <Play className="h-4 w-4 text-white" strokeWidth={2.5} />
                            <span>Start Survey</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
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
                {/* Rows per page */}
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    Rows per page:
                  </span>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-20 h-8 rounded-full border-gray-300 dark:border-gray-600">
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
      ) : (
        // Table View
        <Card>
          <CardContent>
            <div className="mb-4 flex justify-end mt-4">
              <div className="relative w-50 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500 z-10" />
                <Input
                  type="search"
                  placeholder="Search surveys..."
                  className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-md focus:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 transition-colors duration-200"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="relative rounded-lg border-2 border-blue-100 dark:border-gray-700 overflow-hidden mb-6 group shadow-md transition-shadow duration-200">
              <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-blue-50/50 to-transparent dark:from-gray-800/50 dark:to-transparent opacity-70 rounded-b-lg pointer-events-none"></div>
              <div className="relative bg-white dark:bg-gray-800/50 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-blue-700/90 dark:bg-blue-900/80">
                    <TableRow className="hover:bg-transparent">
                      <TableHead 
                        className="text-white/95 font-medium py-3 px-4 text-left cursor-pointer hover:bg-blue-700/80 dark:hover:bg-blue-800/90 transition-colors"
                        onClick={() => handleSort('title')}
                      >
                        <div className="flex items-center">
                          Survey
                          {getSortIcon('title')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-white/95 font-medium py-3 px-4 text-left cursor-pointer hover:bg-blue-700/80 dark:hover:bg-blue-800/90 transition-colors"
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center">
                          Status
                          {getSortIcon('status')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="text-white/95 font-medium py-3 px-4 text-left cursor-pointer hover:bg-blue-700/80 dark:hover:bg-blue-800/90 transition-colors"
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center">
                          Created
                          {getSortIcon('createdAt')}
                        </div>
                      </TableHead>
                      <TableHead className="text-white/95 font-medium py-3 px-4 text-right cursor-pointer hover:bg-blue-700/80 dark:hover:bg-blue-800/90 transition-colors">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="bg-white dark:bg-gray-800/30">
                    {currentItems.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center py-8">
                          <div className="flex flex-col items-center justify-center">
                            <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-gray-500 dark:text-gray-400">No surveys found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentItems.map((survey) => (
                        <TableRow 
                          key={survey.id} 
                          onClick={() => handleStartSurvey(survey)}
                          className="group cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                        >
                          <TableCell className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                                <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                              </div>
                              <div>
                                <div className="font-medium text-gray-800 dark:text-gray-200">{survey.title}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {new Date(survey.created_at || survey.createdAt).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric',
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="px-4">
                            {getStatusBadge(survey.status)}
                          </TableCell>
                          <TableCell className="px-4 text-gray-700 dark:text-gray-300">
                            {new Date(survey.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </TableCell>
                          <TableCell className="px-4 text-right">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex justify-end">
                                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md hover:shadow-lg transition-all transform hover:scale-105">
                                    <Play className="h-5 w-5 text-white" strokeWidth={2.5} />
                                  </div>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="left">
                                <p>Start Survey</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))
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
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">Rows per page:</span>
                        <div className="w-24 [&_button]:border-0 [&_button]:ring-1 [&_button]:ring-gray-300 [&_button]:ring-offset-0">
                          <Select
                            value={itemsPerPage.toString()}
                            onValueChange={(value) => setItemsPerPage(Number(value))}
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
                              className={`w-8 h-8 rounded-md text-sm ${
                                currentPage === pageNum
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
