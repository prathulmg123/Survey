import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Eye, FileText, Users, X } from "lucide-react";
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
          <h1 className="text-2xl font-bold tracking-tight">Manage Surveys</h1>
          <p className="text-muted-foreground">
            View, edit, and manage all your surveys in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Search surveys..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Link to="/guide">
            <Button>
              <FileText className="mr-2 h-4 w-4" />
              New Survey
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Surveys</CardTitle>
              <CardDescription>
                {filteredSurveys.length} survey{filteredSurveys.length !== 1 ? 's' : ''} found
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Responses</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSurveys.length > 0 ? (
                filteredSurveys.map((survey) => (
                  <TableRow key={survey.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <div className="font-medium">{survey.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {survey.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(survey.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{survey.responses}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(survey.createdAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(survey.updatedAt).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
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
                              className="h-8 w-8 text-destructive hover:text-destructive/80"
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
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No surveys found. Create your first survey to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">1</span> to{' '}
            <span className="font-medium">{filteredSurveys.length}</span> of{' '}
            <span className="font-medium">{filteredSurveys.length}</span> surveys
          </div>
          <div className="space-x-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm" disabled>
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
