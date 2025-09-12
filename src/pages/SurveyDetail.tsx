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
  // ... other mock surveys
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
          <Loader text="Loading survey..." show={true} size={52} />
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
      <Button 
        variant="ghost" 
        className="mb-4 -ml-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Surveys
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Survey</h1>
          <p className="text-muted-foreground">
            Update the survey details below
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Survey Details</CardTitle>
            <CardDescription>
              Update the survey information as needed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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
                <div className="p-2 bg-muted/50 rounded-md text-sm">
                  {new Date(survey.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Last Updated</Label>
                <div className="p-2 bg-muted/50 rounded-md text-sm">
                  {new Date(survey.updatedAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Responses</Label>
                <div className="p-2 bg-muted/50 rounded-md text-sm">
                  {survey.responses} response{survey.responses !== 1 ? 's' : ''}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Questions</Label>
                <div className="p-2 bg-muted/50 rounded-md text-sm">
                  {survey.questions} question{survey.questions !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </CardContent>
          <CardContent className="flex justify-end gap-3 border-t pt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate(-1)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
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
