import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Calendar, Info, List, CheckCircle } from "lucide-react";
import { Loader } from "@/components/ui/Loader";
import { toast } from "sonner";
import { finalizeSurvey } from "@/api/surveyService";

export default function SurveyCreateView() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [survey, setSurvey] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSurveyData = () => {
      // First check location state (for direct navigation from creation)
      if (location.state?.surveyData) {
        const surveyData = mapApiResponseToUiFormat(location.state.surveyData);
        console.log(location.state.surveyData,"location")
        console.log(surveyData,"surveyData")
        setSurvey(surveyData);
        // Save to localStorage for page reloads
        localStorage.setItem('lastCreatedSurvey', JSON.stringify(surveyData));
        return true;
      }
      
      // Then check localStorage (for page reloads)
      const savedSurvey = localStorage.getItem('lastCreatedSurvey');
      if (savedSurvey) {
        try {
          const parsedSurvey = JSON.parse(savedSurvey);
          setSurvey(parsedSurvey);
          return true;
        } catch (e) {
          console.error('Error parsing saved survey:', e);
          localStorage.removeItem('lastCreatedSurvey');
        }
      }
      
      // If no data found, redirect to create page
      navigate('/surveys/create');
      return false;
    };
    
    loadSurveyData();
    
    // Cleanup function to clear localStorage when component unmounts
    return () => {
      // Optionally clear the saved survey when leaving the page
      // localStorage.removeItem('lastCreatedSurvey');
    };
  }, [location.state, navigate]);

  // Helper function to map API response to UI format
  const mapApiResponseToUiFormat = (apiData: any) => {
    console.log(apiData,"data")
    return {
      ...apiData,
      title: apiData.name?.replace(/-/g, ' ').replace(/\d+$/, '').trim() || 'New Survey',
      description: `Survey ID: ${apiData.human_readable_id || 'new'}`,
      status: 'finalized',
      questions: 0,
      responses: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      topicArea: apiData?.research_areas || [],
      guide_snapshot: apiData.guide_snapshot
    };
  };

  // Handle survey finalization
  const handleFinalize = async () => {
    if (!survey?.name) {
      toast.error('No survey data available to finalize');
      return;
    }

    try {
      const result = await finalizeSurvey(survey);
      
      if (result.success) {
        toast.success(result.message || 'Survey finalized successfully!', {
          icon: <CheckCircle className="w-5 h-5 text-green-500" />
        });
        
        // Update local survey status
        setSurvey((prev: any) => ({
          ...prev,
          status: 'finalized'
        }));
        
        // Optionally redirect after a delay
        setTimeout(() => {
          navigate('/manage');
        }, 1500);
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      console.error('Error finalizing survey:', error);
      toast.error(error.message || 'Failed to finalize survey');
    }
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
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader text="Loading survey..." show={true} size={52} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">
            Preview Survey
          </h2>
          <nav className="flex mt-2" aria-label="Breadcrumb">
            <ol className="flex text-sm items-center space-x-2">
              <li>
                <div>
                  <Link to="/manage" className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline">
                    Survey
                  </Link>
                </div>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="h-5 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 dark:text-gray-400">
                    {survey?.title || 'Preview'}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700/50">
        {/* Header Section */}
        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-700/50">
          <div className="flex flex-col space-y-4">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center gap-4">
                <h1 className="text-xl font-medium text-gray-800 dark:text-gray-200 leading-tight">
                  {survey.title}
                </h1>
                {/* {getStatusBadge(survey.status)} */}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm mt-4">
                <span className="inline-flex items-center text-gray-500 dark:text-gray-400">
                  <Calendar className="h-4 mb-1 w-4 mr-1.5 text-gray-400 dark:text-gray-500" />
                  Created {new Date(survey.createdAt).toLocaleDateString('en-US', { 
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
        </div>

        {/* Details Section */}
        <div className="bg-gray-50/50 dark:bg-gray-800/50 px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Guide</h3>
              <div className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">
                {survey?.source_document_name || 'Product Feedback'}
              </div>
            </div>
            <div className="border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Goal</h3>
              <div className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">
                {survey?.overall_research_goal || 'Understand user satisfaction with new features'}
              </div>
            </div>
            <div className="border-b border-gray-100 dark:border-gray-700/50">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Initiator Question</h3>
              <div className="text-gray-600 dark:text-gray-300 text-sm whitespace-pre-line">
                {survey?.initiator_question || 'How satisfied are you with our product?'}
              </div>
            </div>
          </div>
        </div>

        {/* Topic Area Section */}
        <div className="mt-8 p-6">
          {survey?.topicArea?.map((area: any, index: number) => (
            <Accordion key={`area-${index}`} type="single" collapsible className="w-full space-y-4 mb-6" defaultValue={`area-${index}`}>
              <AccordionItem value={`area-${index}`} className="border-2 border-indigo-200 dark:border-indigo-800/70 rounded-xl overflow-hidden">
                <AccordionTrigger className="px-6 py-4 hover:no-underline bg-indigo-100 dark:bg-indigo-900/40">
                  <div className="flex items-center space-x-4">
                    <span className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Info className="h-5 w-5" />
                    </span>
                    <div className="text-left">
                      <h3 className="text-base font-semibold">Topic Area: {area.name}</h3>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-6 pb-6 pt-0">
                  <div className="space-y-6 mt-6">
                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700/50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Area Name</h4>
                              <p className="text-sm text-gray-900 dark:text-gray-100">{area.name}</p>
                            </div>
                            {area.follow_up_limit && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Follow-up Limit</h4>
                                <p className="text-sm text-gray-900 dark:text-gray-100">{area.follow_up_limit} questions</p>
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h4>
                              <p className="text-sm text-gray-900 dark:text-gray-100">
                                {area.description || 'No description provided for this area.'}
                              </p>
                            </div>
                            {area.consecutive_probes_limit && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Consecutive Probes</h4>
                                <p className="text-sm text-gray-900 dark:text-gray-100">{area.consecutive_probes_limit} probes</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {area.completion_criteria?.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Completion Criteria</h4>
                          <ul className="list-disc pl-5 space-y-1">
                            {area.completion_criteria.map((criteria: string, i: number) => (
                              <li key={`area-criteria-${i}`} className="text-sm text-gray-900 dark:text-gray-100">
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Sub-Topics */}
                    {area.sub_topics?.map((subTopic: any, subIndex: number) => (
                      <div key={`subtopic-${subIndex}`} className="mt-6">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value={`subtopic-${subIndex}`} className="border-2 border-orange-200 dark:border-orange-800/70 rounded-xl overflow-hidden">
                            <AccordionTrigger className="px-5 py-4 hover:no-underline bg-orange-50 dark:bg-orange-900/40 mx-1 my-1 rounded-lg">
                              <div className="flex items-center w-full space-x-4">
                                <span className="h-9 w-9 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400">
                                  <List className="h-4 w-4 flex-shrink-0" />
                                </span>
                                <div className="text-left flex-1 pr-4">
                                  <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">Sub-Topic: {subTopic.name}</h3>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="mb-4 mt-1 px-2 pb-6">
                              <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                                  <div className="md:col-span-3">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Name</p>
                                    <p className="text-sm text-gray-900 dark:text-gray-100">{subTopic.name}</p>
                                  </div>
                                  {subTopic.description && (
                                    <div className="md:col-span-3">
                                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Description</p>
                                      <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{subTopic.description}</p>
                                    </div>
                                  )}
                                  <div className="md:col-span-6">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Follow-up Limit</p>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">{subTopic.follow_up_limit || '0'} questions</p>
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Probes Limit</p>
                                        <p className="text-sm text-gray-900 dark:text-gray-100">{subTopic.consecutive_probes_limit || '0'} probes</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Completion Criteria Section */}
                                {subTopic.completion_criteria?.length > 0 && (
                                  <div className="mt-6">
                                    <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                      <div className="flex items-start">
                                        <div className="flex-shrink-0 h-5 w-5 text-gray-500 dark:text-gray-400">
                                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h.01a1 1 0 100-2H10V9a1 1 0 00-1-1z" clipRule="evenodd" />
                                          </svg>
                                        </div>
                                        <div className="ml-3 flex-1">
                                          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Completion Criteria</h4>
                                          <ul className="space-y-2">
                                            {subTopic.completion_criteria.map((criteria: string, i: number) => (
                                              <li key={`criteria-${i}`} className="text-sm text-gray-700 dark:text-gray-300 flex items-start">
                                                <span className="flex-shrink-0 h-1.5 w-1.5 mt-2 rounded-full bg-gray-500 dark:bg-gray-400 mr-2"></span>
                                                <span className="leading-relaxed">{criteria}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          ))}
        </div>
      <div className=" bottom-0 left-0 right-0  dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end space-x-4">
        <Button 
          variant="outline" 
          onClick={() => window.history.back()}
          className="px-6"
        >
          Back
        </Button>
        <Button 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6"
          onClick={handleFinalize}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4" />
              Finalizing...
            </>
          ) : (
            'Finalize Survey'
          )}
        </Button>
      </div>
      </div>
    
    
    </div>
  );
}
