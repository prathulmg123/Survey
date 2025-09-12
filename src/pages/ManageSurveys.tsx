import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Eye, FileText, Users, X, Plus, ChevronLeft, ChevronRight, Search,ChevronsLeft, ChevronsRight } from "lucide-react";
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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [currentSurvey, setCurrentSurvey] = useState<Survey | null>(null);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  const filteredSurveys = surveys.filter((survey) =>
    survey.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    survey.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const totalItems = filteredSurveys.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredSurveys.slice(startIndex, endIndex);

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

  const confirmDelete = () => {
    if (surveyToDelete) {
      setSurveys(surveys.filter(survey => survey.id !== surveyToDelete.id));
      // In a real app, you would call an API to delete the survey
      setIsDeleteModalOpen(false);
      setSurveyToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteModalOpen(false);
    setSurveyToDelete(null);
  };

  const handleViewClick = (survey: Survey) => {
    setCurrentSurvey(survey);
    setIsViewModalOpen(true);
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
      {/* View Survey Modal */}
      {isViewModalOpen && currentSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-lg border">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-semibold">Survey Details</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsViewModalOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-medium">Survey Title</Label>
                  <div className="p-2 bg-muted/50 rounded-md">
                    {currentSurvey.title}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium">Status</Label>
                  <div className="p-2 bg-muted/50 rounded-md">
                    {getStatusBadge(currentSurvey.status)}
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <Label className="font-medium">Description</Label>
                  <div className="p-3 bg-muted/50 rounded-md min-h-[100px]">
                    {currentSurvey.description || "No description provided"}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium">Created</Label>
                  <div className="p-2 bg-muted/50 rounded-md">
                    {new Date(currentSurvey.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium">Last Updated</Label>
                  <div className="p-2 bg-muted/50 rounded-md">
                    {new Date(currentSurvey.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium">Responses</Label>
                  <div className="p-2 bg-muted/50 rounded-md">
                    {currentSurvey.responses} response{currentSurvey.responses !== 1 ? 's' : ''}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="font-medium">Questions</Label>
                  <div className="p-2 bg-muted/50 rounded-md">
                    {currentSurvey.questions} question{currentSurvey.questions !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button 
                  type="button" 
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleEditClick(currentSurvey);
                  }}
                >
                  Edit Survey
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && surveyToDelete && (
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
      )}


      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">Manage Surveys</h2>

        </div>
      </div>

      <Card>
        <CardContent>
          <div className="mb-4 flex justify-end mt-4">
          <div className="relative w-50 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-blue-500" />
              <Input
                type="search"
                placeholder="Search Survey..."
                className="w-full pl-10 pr-4 py-2 border-2 border-blue-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
          <TableHeader className="bg-blue-600">
            <TableRow className="hover:bg-blue-50">
              <TableHead className="text-white font-medium py-3 px-4 text-left">Survey</TableHead>
              <TableHead className="text-white font-medium py-3 px-4 text-left">Status</TableHead>
              <TableHead className="text-white font-medium py-3 px-4 text-left">Responses</TableHead>
              <TableHead className="text-white font-medium py-3 px-4 text-left">Created</TableHead>
              <TableHead className="text-white font-medium py-3 px-4 text-right">Actions</TableHead>
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
                      className={`${
                        survey.status === 'active'
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
            <select
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              className="border rounded-md px-2 py-1 text-sm text-gray-700 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
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
                  className={`w-8 h-8 rounded-md text-sm ${
                    currentPage === pageNum
                      ? 'bg-blue-600 text-white'
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

{/* View Survey Modal */}
{isViewModalOpen && currentSurvey && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
    <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-background rounded-lg shadow-lg border">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Survey Details</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setIsViewModalOpen(false)}
          className="h-8 w-8 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="font-medium">Survey Title</Label>
            <div className="p-2 bg-muted/50 rounded-md">
              {currentSurvey.title}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Status</Label>
            <div className="p-2 bg-muted/50 rounded-md">
              {getStatusBadge(currentSurvey.status)}
            </div>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <Label className="font-medium">Description</Label>
            <div className="p-3 bg-muted/50 rounded-md min-h-[100px]">
              {currentSurvey.description || "No description provided"}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Created</Label>
            <div className="p-2 bg-muted/50 rounded-md">
              {new Date(currentSurvey.createdAt).toLocaleDateString()}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Last Updated</Label>
            <div className="p-2 bg-muted/50 rounded-md">
              {new Date(currentSurvey.updatedAt).toLocaleDateString()}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Responses</Label>
            <div className="p-2 bg-muted/50 rounded-md">
              {currentSurvey.responses} response{currentSurvey.responses !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="font-medium">Questions</Label>
            <div className="p-2 bg-muted/50 rounded-md">
              {currentSurvey.questions} question{currentSurvey.questions !== 1 ? 's' : ''}
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button 
            type="button" 
            onClick={() => {
              setIsViewModalOpen(false);
              handleEditClick(currentSurvey);
            }}
          >
            Edit Survey
          </Button>
        </div>
      </div>
    </div>
  </div>
)}

/* Delete Confirmation Modal */
{isDeleteModalOpen && surveyToDelete && (
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
}}
