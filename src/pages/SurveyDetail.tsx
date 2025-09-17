import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader } from "@/components/ui/Loader";
import { useLoader } from "@/hooks/useLoader";
import { ArrowLeft } from "lucide-react";

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

export default function SurveyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    const timer = setTimeout(() => {
      // In a real app, you would fetch the survey data by ID from an API
      const foundSurvey = mockSurveys.find(s => s.id === Number(id));
      setSurvey(foundSurvey || null);
      setIsLoading(false);
      hideLoader();
    }, 500);

    return () => {
      clearTimeout(timer);
      hideLoader();
    };
  }, [id, showLoader, hideLoader]);

  const handleInputChange = (field: keyof Survey, value: string) => {
    if (!survey) return;
    setSurvey({
      ...survey,
      [field]: value,
      updatedAt: new Date().toISOString()
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!survey) return;
    
    setIsSaving(true);
    
    // In a real app, you would call an API to update the survey
    setTimeout(() => {
      console.log('Survey updated:', survey);
      setIsSaving(false);
      // Optionally navigate back or show success message
      // navigate('/surveys');
    }, 1000);
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

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader text="Loading..." show={true} size={52} />
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="h-[calc(100vh-4rem)] flex flex-col items-center justify-center space-y-4">
        <h2 className="text-2xl font-bold">Survey not found</h2>
        <p className="text-muted-foreground">The requested survey could not be found.</p>
        <Button onClick={() => navigate('/surveys')}>
          Back to Surveys
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">
            Edit Survey
          </h2>
          <nav className="flex mt-2" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
              <li>
                <div>
                  <a href="/manage" className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  Survey
                  </a>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="h-5 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {survey?.title || 'View'}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>
      <Card className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Survey Title</Label>
                <Input
                  id="title"
                  value={survey.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter survey title"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={survey.status} 
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={survey.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter survey description"
                  className="min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Created</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-300">
                  {new Date(survey.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-300">
                  {new Date(survey.updatedAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Responses</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-300">
                  {survey.responses} response{survey.responses !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Questions</Label>
                <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm text-gray-900 dark:text-gray-300">
                  {survey.questions} question{survey.questions !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </CardContent>
          <CardContent className="flex justify-end border-t border-gray-200 dark:border-gray-700 pt-6">
            <Button type="submit" disabled={isSaving} className="bg-blue-700/90 hover:bg-blue-700/90">
              {isSaving ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" show={true} />
                  Saving...
                </>
              ) : 'Save Changes'}
            </Button>
            
          </CardContent>
        </form>
      </Card>
    </div>
  );
}
