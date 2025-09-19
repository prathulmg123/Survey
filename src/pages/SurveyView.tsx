import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import { getSurveyById } from '@/api/surveyService';

export default function SurveyView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [survey, setSurvey] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurvey = async () => {
      if (!id) return;
      
      try {
        setIsLoading(true);
        const response = await getSurveyById(id);
        if (response.success) {
          setSurvey(response.data);
        } else {
          setError(response.message || 'Failed to fetch survey');
        }
      } catch (err) {
        console.error('Error fetching survey:', err);
        // setError('An error occurred while fetching the survey');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <Button 
          onClick={() => navigate(-1)} 
          variant="outline" 
          className="mt-4"
        >
          Go Back
        </Button>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Survey not found</h2>
        <p className="text-gray-600 mb-4">The requested survey could not be found.</p>
        <Button asChild>
          <Link to="/surveys">Back to Surveys</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button 
        onClick={() => navigate(-1)} 
        variant="outline" 
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Surveys
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{survey.title || 'Survey Details'}</CardTitle>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              survey.status === 'active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {survey.status || 'Unknown Status'}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Survey ID</h3>
              <p className="mt-1">{survey._id}</p>
            </div>
            
            {survey.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="mt-1">{survey.description}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500">Created At</h3>
              <p className="mt-1">
                {new Date(survey.created_at || survey.createdAt).toLocaleString()}
              </p>
            </div>

            {survey.updatedAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="mt-1">
                  {new Date(survey.updatedAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add more sections here for questions, responses, etc. */}
    </div>
  );
}
