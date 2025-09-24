import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Eye, FileText, Users, X, Plus, ChevronLeft, ChevronRight, Search, ChevronsLeft, ChevronsRight, ArrowUpDown, ArrowUp, ArrowDown, Grid, List } from "lucide-react";
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
import { getSurveys, mapApiSurveyToUiSurvey, Survey as ApiSurvey, deleteSurvey,updateSurvey } from "@/api/surveyService";
import { toast } from "sonner";

interface Survey extends ApiSurvey {
  id: number;
  title: string;
  description: string;
  status: string;
  responses: any;
  questions: number;
  createdAt: string;
  updatedAt: string;
}

export default function ManageSurveys() {
  const [searchTerm, setSearchTerm] = useState("");
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [sortField, setSortField] = useState<keyof Survey>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [editingSurveyId, setEditingSurveyId] = useState<number | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [updatedSurvey, setUpdatedSurvey] = useState<Survey[]>([]);
  const navigate = useNavigate();

  // Fetch surveys from API
  const fetchSurveys = useCallback(async () => {
    try {
      setError(null);
      const response = await getSurveys()as any;
      if (response.success) {
        setUpdatedSurvey(response.data.guides)
        const mappedSurveys = response.data.guides.map((survey, index) => 
          mapApiSurveyToUiSurvey(survey, index)
        ) as any;
        console.log(mappedSurveys,"mapped")
        setSurveys(mappedSurveys);
      } else {
        setError(response.message || 'Failed to fetch surveys');
      }
    } catch (err) {
      console.error('Error fetching surveys:', err);
      // setError('An error occurred while fetching surveys');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSurveys();
  }, []);

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
  
  // Use 8 items per page for grid view, current itemsPerPage for table view
  const gridItemsPerPage = 8;
  const effectiveItemsPerPage = viewMode === 'grid' ? gridItemsPerPage : itemsPerPage;
  
  const totalPages = Math.ceil(totalItems / effectiveItemsPerPage);
  const startIndex = (currentPage - 1) * effectiveItemsPerPage;
  const endIndex = Math.min(startIndex + effectiveItemsPerPage, totalItems);
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

  const confirmDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!surveyToDelete) return;
    
    setIsLoading(true);
    try {
      const result = await deleteSurvey(surveyToDelete._id);
      if (result.success) {
        // Remove the deleted survey from the list
        setSurveys(prev => prev.filter(s => s.id !== surveyToDelete.id));
        // Show success message
        toast.success('Survey deleted successfully');
      } else {
        // Show error message from API
        toast.error(result.message || 'Failed to delete survey');
      }
    } catch (error) {
      console.error('Error deleting survey:', error);
      toast.error('An error occurred while deleting the survey');
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setTimeout(() => setSurveyToDelete(null), 200);
    }
  };

  const handleViewClick = (survey: Survey) => {
    navigate(`/surveys/view/${survey._id}`);
  };

  const handleEditClick = (survey: Survey) => {
    navigate(`/surveys/${survey._id}`);
  };

  const startEditing = (survey: Survey) => {
    setEditingSurveyId(survey.id);
    setEditedTitle(survey.title);
  };

  const saveEdit = async (surveyId: number) => {
    try {
      // Find the survey in the surveys array to get the _id
      const surveyToUpdate = surveys.find(survey => survey.id === surveyId);
      
      if (!surveyToUpdate) {
        console.error('Survey not found:', surveyId);
        return;
      }

      // Find the full survey data in updatedSurvey
      const fullSurvey = updatedSurvey.find(survey => 
        survey._id === surveyToUpdate._id || survey.id === surveyId
      );

      if (!fullSurvey) {
        console.error('Full survey data not found for:', surveyId);
        return;
      }

      // Prepare the data for the API call
      const updateData = {
        surveyId: fullSurvey._id,
        name: editedTitle,
        source_document_name: fullSurvey.source_document_name || editedTitle,
        overall_research_goal: fullSurvey.overall_research_goal || '',
        initiator_question: fullSurvey.initiator_question || '',
        research_areas: fullSurvey.research_areas || []
      };

      // Call the API to update the survey
      const response = await updateSurvey(updateData);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to update survey');
      }

      // Update the local state if API call is successful
      const updatedSurveys = surveys.map(survey => 
        survey.id === surveyId ? { ...survey, title: editedTitle } : survey
      );
      
      const updatedSurveyData = updatedSurvey.map(survey => {
        if (survey._id === fullSurvey._id || survey.id === surveyId) {
          return { 
            ...survey, 
            name: editedTitle,
            title: editedTitle 
          };
        }
        return survey;
      });
      
      setSurveys(updatedSurveys);
      setUpdatedSurvey(updatedSurveyData);
      setEditingSurveyId(null);
      toast.success('Survey updated successfully');
    } catch (error) {
      console.error('Error updating survey:', error);
      toast.error(error.message || 'Failed to update survey');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, surveyId: number) => {
    if (e.key === 'Enter') {
      saveEdit(surveyId);
    } else if (e.key === 'Escape') {
      setEditingSurveyId(null);
    }
  };



  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "draft":
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200">Draft</Badge>;
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">Completed</Badge>;
      case "error":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">Error</Badge>
        case "in_progress":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200">In Progress</Badge>;
      default:
        return <Badge variant="outline" className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 capitalize">{status.toLowerCase().replace('_', ' ')}</Badge>;
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


<div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">Survey</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Overview of your survey management
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
          <Button asChild className="bg-blue-700/90 hover:bg-blue-700/90">
            <Link to="/guide" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Survey
            </Link>
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
             placeholder="Search Survey..."
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
              className="border-blue-300 dark:border-blue-500 relative group bg-white dark:bg-gray-800/95 backdrop-blur-sm rounded-2xl border-2 border-gray-200 dark:border-gray-600 overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col h-full hover:border-blue-300 dark:hover:border-blue-500 hover:ring-2 hover:ring-blue-200 dark:hover:ring-blue-900/40 w-full max-w-[400px]"
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
                  {editingSurveyId === survey.id ? (
                    <input
                      type="text"
                      value={editedTitle}
                      onChange={(e) => setEditedTitle(e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, survey.id)}
                      onBlur={() => saveEdit(survey.id)}
                      autoFocus
                      className="w-full text-lg font-semibold text-gray-900 dark:text-white bg-transparent border-b border-blue-500 focus:outline-none focus:border-blue-700"
                    />
                  ) : (
                    <h3 
                      className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1 cursor-text hover:bg-gray-100 dark:hover:bg-gray-800 px-1 rounded"
                      onClick={() => startEditing(survey)}
                    >
                      {survey.title || 'Untitled Survey'}
                    </h3>
                  )}
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
                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleViewClick(survey)}
                        >
                          <Eye className="h-4 w-4" />
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
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Edit Survey</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30"
                          onClick={() => handleDeleteClick(survey)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Survey</TooltipContent>
                    </Tooltip>
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
             {/* Rows per page - Only show in table view */}
            
 
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
                    <TableHead className="text-white/95 font-medium py-3 px-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody className="bg-white dark:bg-gray-800/30">
                  {currentItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center py-8">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-2" />
                          <p className="text-gray-500 dark:text-gray-400">No surveys found</p>
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
                              {editingSurveyId === survey.id ? (
                                <Input
                                  type="text"
                                  value={editedTitle}
                                  onChange={(e) => setEditedTitle(e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, survey.id)}
                                  onBlur={() => saveEdit(survey.id)}
                                  autoFocus
                                  className="h-8 px-2 py-1 text-sm border-blue-300 focus-visible:ring-1 focus-visible:ring-blue-500"
                                />
                              ) : (
                                <div 
                                  className="font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 px-2 py-1 rounded cursor-text"
                                  onClick={() => startEditing(survey)}
                                >
                                  {survey.title}
                                </div>
                              )}
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
                          <div className="flex justify-end gap-2">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-transparent dark:text-gray-400 dark:hover:text-gray-200"
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
                                  className="h-8 w-8 text-gray-600 hover:text-gray-900 hover:bg-transparent dark:text-gray-400 dark:hover:text-gray-200"
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
                                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-transparent dark:text-red-500 dark:hover:text-red-400"
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
