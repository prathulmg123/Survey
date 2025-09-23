import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Loader } from "@/components/ui/Loader";
import { ArrowLeft, Info, List, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { getSurveyById, finalizeSurvey ,updateSurvey} from "@/api/surveyService";
import { Calendar } from "lucide-react";

interface Survey {
  id: string;
  _id?: string;
  title: string;
  description: string;
  status: string;
  responses: number;
  questions: number;
  createdAt: string;
  updatedAt: string;
  guideName: string;
  surveyGoal?: string;
  initiatorQuestion?: string;
  areaName?: string;
  areaDescription?: string;
  subTopicName?: string;
  followUpLimit?: number;
  consecutiveProbesLimit?: number;
  completionCriteria?: string | string[];
  source_document_name?: string;
  research_areas?: Array<{
    id: string;
    name: string;
    description: string;
    sub_topics?: Array<{
      id: string;
      name: string;
      description: string;
      follow_up_limit?: number;
      consecutive_probes_limit?: number;
      completion_criteria?: string[];
    }>;
  }>;
}

// Sub-topic schema
const subTopicSchema = z.object({
  id: z.string().optional(),
  name: z.string()
    .min(1, { message: "Sub-topic name is required" })
    .max(100, { message: "Sub-topic name cannot exceed 100 characters" })
    .trim(),
  description: z.string().trim().optional(),
  follow_up_limit: z.union([
    z.number()
      .int({ message: "Must be a whole number" })
      .min(0, { message: "Cannot be negative" })
      .max(10, { message: "Cannot exceed 10" }),
    z.string().transform(val => val === '' ? 0 : parseInt(val, 10))
  ]).default(3),
  consecutive_probes_limit: z.union([
    z.number()
      .int({ message: "Must be a whole number" })
      .min(0, { message: "Cannot be negative" })
      .max(10, { message: "Cannot exceed 10" }),
    z.string().transform(val => val === '' ? 0 : parseInt(val, 10))
  ]).default(3),
  completion_criteria: z.array(
    z.string().min(1, "Criteria cannot be empty")
  ).default(['']).optional()
});

// Research area schema
const researchAreaSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Area name is required'),
  description: z.string().optional(),
  sub_topics: z.array(subTopicSchema).min(1, 'At least one sub-topic is required')
});

// Main form schema
const formSchema = z.object({
  guideName: z.string().min(1, 'Guide name is required'),
  surveyGoal: z.string().min(1, 'Research goal is required'),
  initiatorQuestion: z.string().min(1, 'Initiator question is required'),
  researchAreas: z.array(researchAreaSchema).min(1, 'At least one research area is required')
});

type FormValues = z.infer<typeof formSchema>;

export default function SurveyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guideName: '',
      surveyGoal: '',
      initiatorQuestion: '',
      researchAreas: [{
        id: `area_${Date.now()}`,
        name: '',
        description: '',
        sub_topics: [{
          id: `sub_${Date.now()}`,
          name: '',
          description: '',
          follow_up_limit: 3,
          consecutive_probes_limit: 3,
          completion_criteria: ['']
        }]
      }]
    },
    mode: 'onChange'
  });

  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch survey data when component mounts
  useEffect(() => {
    const fetchSurvey = async () => {
      if (!id) return;
      
      try {
        const response = await getSurveyById(id);
        
        if (response.success) {
          const surveyData = response.data;
          
          // Map API response to form fields
          form.reset({
            guideName: surveyData.name || '',
            surveyGoal: surveyData.overall_research_goal || '',
            initiatorQuestion: surveyData.initiator_question || '',
            researchAreas: (surveyData.research_areas || []).map(area => ({
              id: area.id || `area_${Date.now()}`,
              name: area.name || '',
              description: area.description || '',
              sub_topics: (area.sub_topics || []).map(subTopic => ({
                id: subTopic.id || `sub_${Date.now()}`,
                name: subTopic.name || '',
                description: subTopic.description || '',
                follow_up_limit: subTopic.follow_up_limit || 3,
                consecutive_probes_limit: subTopic.consecutive_probes_limit || 3,
                completion_criteria: Array.isArray(subTopic.completion_criteria) 
                  ? subTopic.completion_criteria 
                  : ['']
              }))
            }))
          });
          
          // Update survey state
          setSurvey({
            id: surveyData._id,
            _id: surveyData._id,
            title: surveyData.name || 'Survey',
            description: surveyData.overall_research_goal || '',
            status: surveyData.status || 'draft',
            responses: 0,
            questions: 0,
            createdAt: surveyData.created_at || new Date().toISOString(),
            updatedAt: surveyData.updated_at || new Date().toISOString(),
            guideName: surveyData.name || '',
            surveyGoal: surveyData.overall_research_goal || '',
            initiatorQuestion: surveyData.initiator_question || '',
            source_document_name: surveyData.source_document_name || surveyData.name || '',
            research_areas: surveyData.research_areas || []
          });
        } else {
          setError(response.message || 'Failed to fetch survey');
          toast.error(response.message || 'Failed to load survey');
        }
      } catch (err) {
        console.error('Error fetching survey:', err);
        setError('An error occurred while loading the survey');
        toast.error('Failed to load survey');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSurvey();
  }, [id, form]);

  const handleInputChange = (field: keyof Survey, value: any) => {
    setSurvey(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
    form.setValue(field as any, value, { shouldValidate: true });
  };


  // Helper function to add a new completion criteria to a sub-topic
  const addCompletionCriteria = (areaIndex: number, subTopicIndex: number) => {
    const currentCriteria = form.getValues(`researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.completion_criteria`) || [];
    const newCriteria = [...currentCriteria, ''];
    
    form.setValue(
      `researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.completion_criteria`,
      newCriteria,
      { shouldValidate: false } // Disable validation when adding a new field
    );
  };

  // Helper function to remove a research area
  const removeResearchArea = (index: number) => {
    const currentAreas = [...(form.getValues('researchAreas') || [])];
    currentAreas.splice(index, 1);
    form.setValue('researchAreas', currentAreas);
  };

  // Helper function to remove a sub-topic
  const removeSubTopic = (areaIndex: number, subTopicIndex: number) => {
    const currentAreas = [...(form.getValues('researchAreas') || [])];
    if (currentAreas[areaIndex]?.sub_topics) {
      currentAreas[areaIndex].sub_topics.splice(subTopicIndex, 1);
      form.setValue('researchAreas', currentAreas);
    }
  };

  // Helper function to remove a completion criteria
  const removeCompletionCriteria = (areaIndex: number, subTopicIndex: number, criteriaIndex: number) => {
    const currentCriteria = form.getValues(`researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.completion_criteria`) || [];
    const newCriteria = currentCriteria.filter((_, i) => i !== criteriaIndex);
    
    // Ensure we always have at least one criteria
    if (newCriteria.length === 0) {
      newCriteria.push('');
    }
    
    form.setValue(
      `researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.completion_criteria`,
      newCriteria,
      { shouldValidate: true, shouldDirty: true, shouldTouch: true }
    );
  };

  const onSubmit = async (formData: FormValues) => {
    try {
      if (!survey?._id) {
        throw new Error('Survey ID is missing');
      }
      
      setIsSaving(true);
      
      // Format the request body according to the API structure
      const requestBody = {
        surveyId: survey._id,
        name: formData.guideName,
        status: 'finalized',
        source_document_name: survey.source_document_name || formData.guideName,
        overall_research_goal: formData.surveyGoal,
        initiator_question: formData.initiatorQuestion,
        research_areas: formData.researchAreas.map(area => ({
          id: area.id || `area_${Date.now()}`,
          name: area.name,
          description: area.description,
          sub_topics: area.sub_topics.map(subTopic => ({
            id: subTopic.id || `sub_${Date.now()}`,
            name: subTopic.name || 'Untitled Sub-topic',
            description: subTopic.description || '',
            follow_up_limit: Number(subTopic.follow_up_limit) || 3,
            consecutive_probes_limit: Number(subTopic.consecutive_probes_limit) || 3,
            completion_criteria: Array.isArray(subTopic.completion_criteria)
              ? subTopic.completion_criteria.filter((criteria: string) => criteria.trim() !== '')
              : ['Default completion criteria']
          }))
        }))
      };
      
      console.log('Submitting survey data:', requestBody);
      
      // Call the finalizeSurvey API
      const response = await updateSurvey(requestBody);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to save survey');
      }
      
      // Update local state with the new data
      setSurvey(prev => ({
        ...prev!,
        title: formData.guideName,
        guideName: formData.guideName,
        surveyGoal: formData.surveyGoal,
        initiatorQuestion: formData.initiatorQuestion,
        research_areas: requestBody.research_areas,
        updatedAt: new Date().toISOString()
      }));
      
      // Show success message and navigate
      toast.success('Survey saved successfully');
      navigate('/manage');
      
    } catch (error) {
      console.error('Error saving survey:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save survey');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Manually trigger validation and get the result
    const result = await form.trigger();
    
    if (result) {
      // If validation passes, submit the form
      await form.handleSubmit(onSubmit)();
    } else {
      // If validation fails, show error toast
      toast.error('Please fix the form errors before submitting.');
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

  if (error || !survey) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error || 'Survey not found'}</p>
          <Button onClick={() => navigate('/manage')} variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Surveys
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div >
      <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">
            Edit Survey
          </h2>
        <nav className="flex mt-2" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link 
                to="/manage" 
                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
              >
                Surveys
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-500 dark:text-gray-400">
              {survey?.id ? 'Edit' : 'Create'} Survey
            </li>
          </ol>
        </nav>
      </div>

      <Form {...form}>
        <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
          <Card className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            {/* <CardHeader className="border-b dark:border-gray-700"> */}
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
                Created {survey.createdAt ? new Date(survey.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                }) : 'N/A'}
              </span>
              {survey.questions > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {survey.questions}
                    </span>{' '}
                    question{survey.questions !== 1 ? 's' : ''}
                  </span>
                </>
              )}
              {survey.responses > 0 && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">•</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {survey.responses}
                    </span>{' '}
                    response{survey.responses !== 1 ? 's' : ''}
                  </span>
                </>
              )}
            </div>
            </div>
          </div>
        </div>
            {/* </CardHeader> */}
            <CardContent className="p-6 space-y-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="guideName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 dark:text-gray-300">
                          Guide Name
                          <span className="text-destructive ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Customer Feedback Template"
                            {...field}
                            className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="surveyGoal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center text-gray-700 dark:text-gray-300">
                          Survey Goal
                          <span className="text-destructive ml-1">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative w-full">
                            <div 
                              className="text-gray-900 dark:text-white text-sm py-2 px-3 bg-transparent w-full whitespace-normal break-words"
                            >
                              {field.value || 'No survey goal set'}
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="initiatorQuestion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center text-gray-700 dark:text-gray-300">
                        Initiator Question
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter the first question participants will see..."
                           className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Topic Area Accordion */}
              {form.watch('researchAreas')?.map((area, areaIndex) => (
              <Accordion type="single" collapsible  className="w-full space-y-4">
                <AccordionItem value="topic-area" className="border-2 border-indigo-200 dark:border-indigo-800/70 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline bg-indigo-100 dark:bg-indigo-900/40">
                      <div className="flex items-center gap-3">
                      <span className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <Info className="h-5 w-5" />
                      </span>
                      <div className="text-left">
                        <h3 className="text-base font-semibold">
                          Topic Area: {area.name}
                        </h3>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-0">
                    <div className="space-y-6 mt-6">
                      <div className="space-y-6">

                        <FormField
                          control={form.control}
                          name="researchAreas"
                          render={() => (
                            <FormItem>
                             
                                    <div className="space-y-6">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <FormField
                                          control={form.control}
                                          name={`researchAreas.${areaIndex}.name`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Area Name</FormLabel>
                                              <FormControl>
                                              <div className="relative w-full">
                                              <div 
                                                className="text-gray-900 dark:text-white text-sm py-2 px-3 bg-transparent w-full whitespace-normal break-words"
                                              >
                                                {field.value || 'No area name'}
                                              </div>
                                            </div>
                                                {/* <Input
                                                  placeholder="e.g., Product Features"
                                                  {...field}
                                                  className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                /> */}
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                        <FormField
                                          control={form.control}
                                          name={`researchAreas.${areaIndex}.description`}
                                          render={({ field }) => (
                                            <FormItem>
                                              <FormLabel>Description</FormLabel>
                                              <FormControl>
                                              <div className="relative w-full">
                                              <div 
                                                className="text-gray-900 dark:text-white text-sm py-2 px-3 bg-transparent w-full whitespace-normal break-words"
                                              >
                                                {field.value || 'No description'}
                                              </div>
                                            </div>
                                                {/* <Textarea
                                                  placeholder="Describe this research area"
                                                  {...field}
                                                  className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                  rows={3}
                                                /> */}
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>

                                      {/* Sub-Topics */}
                                      <div className="space-y-4">
                                        <Accordion type="single" collapsible className="w-full ">
                                          {area.sub_topics?.map((subTopic, subTopicIndex) => (
                                            <AccordionItem key={subTopic.id} value={`item-${subTopic.id}`} className="border-2 border-orange-200 dark:border-orange-800/70 rounded-xl overflow-hidden">
                                              <AccordionTrigger className="px-5 py-4 hover:no-underline bg-orange-50 dark:bg-orange-900/40 mx-1 my-1 rounded-lg">
                                                {/* <div className="flex items-center gap-2 flex-1 text-left">
                                                  <List className="h-4 w-4 text-orange-500 flex-shrink-0" />
                                                  <h5 className="text-sm font-medium truncate">
                                                    Sub Topic : {subTopic.name || 'Untitled Sub-Topic'}
                                                  </h5>
                                                </div> */}
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
                                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <FormField
                                                  control={form.control}
                                                  name={`researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.name`}
                                                  render={({ field }) => (
                                                    <FormItem>
                                                      <FormLabel>Sub-Topic Name</FormLabel>
                                                      <FormControl>
                                                      <div className="relative w-full">
                                                        <div 
                                                          className="text-gray-900 dark:text-white text-sm py-2 px-3 bg-transparent w-full whitespace-normal break-words"
                                                        >
                                                          {field.value || 'No sub topic'}
                                                        </div>
                                                      </div>
                                                        {/* <Input
                                                          placeholder="e.g., Dynamic Island"
                                                          {...field}
                                                          className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        /> */}
                                                      </FormControl>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                                <FormField
                                                  control={form.control}
                                                  name={`researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.description`}
                                                  render={({ field }) => (
                                                    <FormItem>
                                                      <FormLabel>Description (Optional)</FormLabel>
                                                      <FormControl>
                                                      <div className="relative w-full">
                                                        <div 
                                                          className="text-gray-900 dark:text-white text-sm py-2 px-3 bg-transparent w-full whitespace-normal break-words"
                                                        >
                                                          {field.value || 'No description'}
                                                        </div>
                                                      </div>
                                                        {/* <Input
                                                          placeholder="Brief description"
                                                          {...field}
                                                          className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        /> */}
                                                      </FormControl>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                              </div>

                                              <div className="grid grid-cols-1 md:grid-cols-2 mt-5 gap-6">
                                                <FormField
                                                  control={form.control}
                                                  name={`researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.follow_up_limit`}
                                                  render={({ field }) => (
                                                    <FormItem>
                                                      <FormLabel>Follow-up Limit</FormLabel>
                                                      <FormControl>
                                                        <Input
                                                          type="number"
                                                          min="0"
                                                          max="10"
                                                          placeholder="e.g., 3"
                                                          {...field}
                                                          value={field.value}
                                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                                          className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        />
                                                      </FormControl>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                                <FormField
                                                  control={form.control}
                                                  name={`researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.consecutive_probes_limit`}
                                                  render={({ field }) => (
                                                    <FormItem>
                                                      <FormLabel>Consecutive Probes Limit</FormLabel>
                                                      <FormControl>
                                                        <Input
                                                          type="number"
                                                          min="0"
                                                          max="10"
                                                          placeholder="e.g., 2"
                                                          {...field}
                                                          value={field.value}
                                                          onChange={(e) => field.onChange(Number(e.target.value))}
                                                          className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                        />
                                                      </FormControl>
                                                      <FormMessage />
                                                    </FormItem>
                                                  )}
                                                />
                                              </div>

                                              <FormField
                                                control={form.control}
                                                name={`researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.completion_criteria`}
                                                render={({ field }) => (
                                                  <FormItem>
                                                    <FormLabel className="flex justify-between items-center mt-5">
                                                      <span>Completion Criteria</span>
                                                      <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => addCompletionCriteria(areaIndex, subTopicIndex)}
                                                        className="h-7 text-xs"
                                                      >
                                                        <Plus className="h-3 w-3 mr-1" /> Add Criteria
                                                      </Button>
                                                    </FormLabel>
                                                    <div className="space-y-2">
                                                      {field.value?.map((criteria, criteriaIndex) => (
                                                        <div key={criteriaIndex} className="flex items-center gap-2">
                                                          <Input
                                                            placeholder="Enter completion criteria"
                                                            value={criteria || ''}
                                                            onChange={(e) => {
                                                              const currentCriteria = form.getValues(`researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.completion_criteria`) || [];
                                                              const newCriteria = [...currentCriteria];
                                                              newCriteria[criteriaIndex] = e.target.value;
                                                              
                                                              form.setValue(
                                                                `researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.completion_criteria`,
                                                                newCriteria,
                                                                { 
                                                                  shouldValidate: true, // Only validate when user types
                                                                  shouldDirty: true,
                                                                  shouldTouch: true
                                                                }
                                                              );
                                                            }}
                                                            onBlur={() => {
                                                              // Trigger validation on blur
                                                              form.trigger(`researchAreas.${areaIndex}.sub_topics.${subTopicIndex}.completion_criteria`);
                                                            }}
                                                            className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                          />
                                                          <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-9 w-9 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                            onClick={() => removeCompletionCriteria(areaIndex, subTopicIndex, criteriaIndex)}
                                                          >
                                                            <Trash2 className="h-4 w-4" />
                                                          </Button>
                                                        </div>
                                                      ))}
                                                    </div>
                                                    <FormMessage />
                                                  </FormItem>
                                                )}
                                              />
                                              </div>
                                              </AccordionContent>
                                            </AccordionItem>
                                          ))}
                                        </Accordion>
                                      </div>
                                    </div>
                             
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ))}
            {form.formState.errors.researchAreas && (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.researchAreas.message}
              </p>
            )}
            </CardContent>
            
            <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="border-gray-300 dark:border-gray-600"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSaving} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={async (e) => {
                  e.preventDefault();
                  const isValid = await form.trigger();
                  if (isValid) {
                    await form.handleSubmit(onSubmit)();
                  } else {
                    toast.error('Please fill the mandatory fields..');
                  }
                }}
              >
                {isSaving ? (
                  <>
                    <Loader className="mr-2 h-4 w-4 animate-spin" show={true} />
                    Saving...
                  </>
                ) : 'Save Changes'}
              </Button>
            </div>
          </Card>
        </form>
      </Form>
    </div>
  );
}
