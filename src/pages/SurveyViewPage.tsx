import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useLoader } from "@/hooks/useLoader";
import { Loader } from "@/components/ui/Loader";

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

export default function SurveyViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showLoader, hideLoader } = useLoader();
  const [isLoading, setIsLoading] = useState(true);
  const [survey, setSurvey] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      // In a real app, this would be an API call
      const foundSurvey = mockSurveys.find(s => s.id === parseInt(id || '0'));
      if (foundSurvey) {
        setSurvey(foundSurvey);
      }
      setIsLoading(false);
      hideLoader();
    }, 500);

    return () => clearTimeout(timer);
  }, [id, showLoader, hideLoader]);

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
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Survey not found</h2>
          <p className="text-gray-600 mb-4">The requested survey could not be found.</p>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Surveys
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 ">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">
            View Survey
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
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
            className="text-gray-700 hover:bg-white hover:text-gray-700"
          >
            Back
          </Button>
          <Button 
            onClick={() => navigate(`/surveys/${survey.id}`)}
            className="bg-blue-700/90 hover:bg-blue-700/90"
          >
            Edit Survey
          </Button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 space-y-8">


        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
          <div className="space-y-1">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Survey Title
            </Label>
            <Input
              id="title"
              value={survey.title}
              disabled
              className="bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Status
            </Label>
            <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm">
              {getStatusBadge(survey.status)}
            </div>
          </div>

          <div className="md:col-span-2 space-y-1">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              value={survey.description || "No description provided"}
              disabled
              className="min-h-[100px] bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:col-span-2 border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created
              </Label>
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm">
                {new Date(survey.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Last Updated
              </Label>
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm">
                {new Date(survey.updatedAt).toLocaleDateString()}
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Responses
              </Label>
              <div className="p-2 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600 text-sm">
                {survey.responses} response{survey.responses !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          <div className="space-y-1 md:col-span-2">
            <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Questions
            </Label>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {survey.questions} question{survey.questions !== 1 ? 's' : ''} in this survey
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
