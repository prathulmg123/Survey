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
import { toast } from "sonner";

interface Survey {
  id: number;
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
  completionCriteria?: string;
}

// Form validation schema
const formSchema = z.object({
  guideName: z.string()
    .min(1, { message: "Guide name is required" })
    .min(3, { message: "Guide name must be at least 3 characters" })
    .trim(),
    
  surveyGoal: z.string()
    .min(1, { message: "Survey goal is required" })
    .trim(),
    
  initiatorQuestion: z.string()
    .min(1, { message: "Initiator question is required" })
    .trim(),
    
  areaName: z.string()
    .min(1, { message: "Area name is required" })
    .trim(),
    
  areaDescription: z.string()
    .min(1, { message: "Area description is required" })
    .max(500, { message: "Area description cannot exceed 500 characters" })
    .trim(),
    
  subTopicName: z.string()
    .max(100, { message: "Sub-topic name cannot exceed 100 characters" })
    .trim()
    .optional(),
    
  followUpLimit: z.number()
    .int({ message: "Must be a whole number" })
    .min(0, { message: "Cannot be negative" })
    .max(10, { message: "Cannot exceed 10" })
    .optional()
    .or(z.literal('')),
    
  consecutiveProbesLimit: z.number()
    .int({ message: "Must be a whole number" })
    .min(0, { message: "Cannot be negative" })
    .max(10, { message: "Cannot exceed 10" })
    .optional()
    .or(z.literal('')),
    
  completionCriteria: z.string()
    .max(500, { message: "Completion criteria cannot exceed 500 characters" })
    .trim()
    .optional()
});

type FormValues = z.infer<typeof formSchema>;

export default function SurveyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      guideName: "Product Feedback",
      surveyGoal: "Understand user satisfaction with new features",
      initiatorQuestion: "How satisfied are you with our product?",
      areaName: "User Interface",
      areaDescription: "Gathering feedback on the new UI components and layout",
      subTopicName: "",
      followUpLimit: 0,
      consecutiveProbesLimit: 0,
      completionCriteria: ""
    }
  });

  const [survey, setSurvey] = useState<Survey>({
    id: 1,
    title: "Edit Survey",
    description: "Gather feedback on our latest product features",
    status: "Draft",
    responses: 0,
    questions: 12,
    createdAt: "2023-05-15",
    updatedAt: "2023-05-20",
    guideName: "Product Feedback",
    surveyGoal: "Understand user satisfaction with new features",
    initiatorQuestion: "How satisfied are you with our product?",
    areaName: "User Interface",
    areaDescription: "Gathering feedback on the new UI components and layout"
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleInputChange = (field: keyof Survey, value: any) => {
    setSurvey(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date().toISOString()
    }));
    form.setValue(field as any, value, { shouldValidate: true });
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSaving(true);
      console.log('Form submitted:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedSurvey: Survey = {
        ...survey,
        guideName: data.guideName,
        surveyGoal: data.surveyGoal,
        initiatorQuestion: data.initiatorQuestion,
        areaName: data.areaName,
        areaDescription: data.areaDescription,
        subTopicName: data.subTopicName,
        followUpLimit: data.followUpLimit ? Number(data.followUpLimit) : undefined,
        consecutiveProbesLimit: data.consecutiveProbesLimit ? Number(data.consecutiveProbesLimit) : undefined,
        completionCriteria: data.completionCriteria,
        updatedAt: new Date().toISOString()
      };
      
      setSurvey(updatedSurvey);
      toast.success('Survey saved successfully!');
    } catch (error) {
      console.error('Error saving survey:', error);
      toast.error('Failed to save survey. Please try again.');
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div >
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {survey?.title || 'New Survey'}
            </h1>
          </div>
        </div>
        <nav className="flex" aria-label="Breadcrumb">
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
            <CardHeader className="border-b dark:border-gray-700">
              <CardTitle className="text-lg font-semibold">
                Survey Information
              </CardTitle>
            </CardHeader>
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
                          <Input
                            placeholder="What do you want to learn?"
                            {...field}
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
              <Accordion type="single" collapsible  className="w-full space-y-4">
                <AccordionItem value="topic-area" className="border-2 border-indigo-200 dark:border-indigo-800/70 rounded-xl overflow-hidden">
                  <AccordionTrigger className="px-6 py-4 hover:no-underline bg-indigo-100 dark:bg-indigo-900/40">
                    <div className="flex items-center space-x-4">
                      <span className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h2a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </span>
                      <div className="text-left">
                        <h3 className="text-base font-semibold">Topic Area</h3>
                        <p className="text-sm text-muted-foreground">Feature Appeal</p>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-0">
                    <div className="space-y-6 mt-6">
                      <FormField
                        control={form.control}
                        name="areaName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-gray-700 dark:text-gray-300">
                              Area Name
                              <span className="text-destructive ml-1">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g., Product Features"
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
                        name="areaDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="flex items-center text-gray-700 dark:text-gray-300">Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what this topic area covers..."
                                className="min-h-[100px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Sub-Topic Accordion */}
                      <div className="pt-6 border-t border-border">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="sub-topic" className="border-2 border-orange-200 dark:border-orange-800/70 rounded-xl overflow-hidden">
                            <AccordionTrigger className="px-5 py-3 hover:no-underline bg-orange-50 dark:bg-orange-900/40">
                              <div className="flex items-center space-x-3">
                                <span className="h-8 w-8 rounded-md bg-white dark:bg-slate-700 flex items-center justify-center text-orange-600 dark:text-orange-500 shadow-sm">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                                  </svg>
                                </span>
                                <div className="text-left">
                                  <h3 className="text-base font-medium">Sub-Topic</h3>
                                  <p className="text-sm text-muted-foreground">Dynamic Island Expansion</p>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent className="mb-4 mt-3 px-8 pb-6">
                              <div className="space-y-6 pt-4">
                                <FormField
                                  control={form.control}
                                  name="subTopicName"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center text-gray-700 dark:text-gray-300">Sub-Topic Name</FormLabel>
                                      <FormControl>
                                        <Input
                                          placeholder="e.g., Dynamic Island Features"
                                          {...field}
                                          className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <FormField
                                    control={form.control}
                                    name="followUpLimit"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="flex items-center text-gray-700 dark:text-gray-300">Follow-up Limit</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            placeholder="e.g., 3"
                                            {...field}
                                                value={field.value}
                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                            onBlur={field.onBlur}
                                            disabled={isSaving}
                                            className="bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                          />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <FormField
                                    control={form.control}
                                    name="consecutiveProbesLimit"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="flex items-center text-gray-700 dark:text-gray-300">Consecutive Probes Limit</FormLabel>
                                        <FormControl>
                                          <Input
                                            type="number"
                                            min="0"
                                            placeholder="e.g., 2"
                                            {...field}
                                                value={field.value}
                                            onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                                            onBlur={field.onBlur}
                                            disabled={isSaving}
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
                                  name="completionCriteria"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className="flex items-center text-gray-700 dark:text-gray-300">Completion Criteria</FormLabel>
                                      <FormControl>
                                        <Textarea
                                          placeholder="Define when this sub-topic should be marked as complete..."
                                          className="min-h-[80px] bg-white dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                          {...field}
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
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
