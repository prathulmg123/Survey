import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader } from "@/components/ui/Loader";
import { useLoader } from "@/hooks/useLoader";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { createSurveyDraft } from "@/api/surveyService";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, Plus, Trash2, Upload, Loader2 } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

// Types
type FileWithPreview = File & {
  preview: string;
};

// Form validation schema
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['application/pdf'];

// Helper function to create a FileWithPreview from a File
const createFileWithPreview = (file: File): FileWithPreview => {
  return Object.assign(file, {
    preview: URL.createObjectURL(file)
  });
};

const formSchema = z.object({
  surveyTitle: z.string()
  .min(1, { message: "Survey name is required" })
    .min(5, { message: "Survey name must be at least 5 characters" })
    .max(100, { message: "Survey name cannot exceed 100 characters" })
    .trim(),
    
  description: z.string()
    .max(500, { message: "Description cannot exceed 500 characters" })
    .optional()
    .or(z.literal('')),
    
  files: z
    .array(z.any())
    .refine(
      (files) => files && files.length > 0,
      { message: "A PDF file is required" }
    )
    .refine(
      (files) => files.every((file) => file.size <= MAX_FILE_SIZE),
      { message: "File must be less than 5MB" }
    )
    .refine(
      (files) => files.every((file) => ALLOWED_FILE_TYPES.includes(file.type)),
      { message: "Only PDF files are allowed" }
    )
    .transform((files) => {
      return files.map(file => createFileWithPreview(file as File));
    }),
    

});

type QuestionType = "text" | "multiple_choice" | "single_choice" | "rating";

const questionTypes = [
  { id: "text", label: "Text Answer" },
  { id: "single_choice", label: "Single Choice" },
  { id: "multiple_choice", label: "Multiple Choice" },
  { id: "rating", label: "Rating" },
];

export default function SurveyGuide() {
  const [isApiLoading, setIsApiLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const navigate = useNavigate();
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surveyTitle: "",
      description: "",
      files: []
    },
    mode: "onChange",
    reValidateMode: "onChange",
    shouldFocusError: true
  });

  // Watch the survey title field to trigger validation on change
  const surveyTitle = form.watch("surveyTitle");
  
  // Trigger validation whenever surveyTitle changes
  useEffect(() => {
    if (surveyTitle !== undefined) {
      form.trigger("surveyTitle");
    }
  }, [surveyTitle, form]);

  // Handle page loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPageLoading(false);
      hideLoader();
    }, 500);

    return () => {
      clearTimeout(timer);
      hideLoader();
    };
  }, [showLoader, hideLoader]);

  // Show loading state
  if (isPageLoading) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <Loader text="Loading..." show={true} size={52} />
        </div>
      </div>
    );
  }
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    setIsApiLoading(true);
    showLoader('Creating survey...');
    
    try {
      if (!values.files || values.files.length === 0) {
        throw new Error('Please upload a file');
      }
      
      // Call the API with query parameters and file
      const response = await createSurveyDraft({
        name: values.surveyTitle,
        description: values.description,
        file: values.files[0]
      });
      
      if (response.success) {
        toast.success('Survey created successfully!',{
          position: 'top-right',
          duration: 2000,
          style: {
            marginTop: '30px'
          }
        });
        // Navigate to the create view page with the response data
        console.log(response.data,"created")
        navigate('/surveys/create-view', { 
          state: { 
            surveyData: response.data,
            // Include any additional data you want to pass
            fromCreate: true 
          } 
        });
      } else {
        throw new Error(response.message || 'Failed to create survey');
      }
    } catch (error) {
      console.error('Error creating survey:', error);
      toast.error(error.message || 'An error occurred while creating the survey');
    } finally {
      setIsSubmitting(false);
      setIsApiLoading(false);
      hideLoader();
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submit event triggered');
    
    // Manually trigger validation and get the result
    const result = await form.trigger();
    console.log('Form validation result:', result);
    
    if (result) {
      // If validation passes, get and log the values
      const values = form.getValues();
      console.log('Form values:', values);
      
      // Log files if they exist
      if (values.files?.length) {
        console.log('Uploaded files:', values.files.map(f => ({
          name: f.name,
          size: f.size,
          type: f.type
        })));
      }
      
      // Call the actual submit handler
      onSubmit(values);
    } else {
      console.log('Form validation failed');
      console.log('Form errors:', form.formState.errors);
    }
  };

  return (
    <div className="relative">
      {/* Full-screen overlay loader */}
      {isApiLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
            <Loader show={true} size={48} />
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">
              Creating your survey...
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Please wait while we process your request.
              <br />This may take a few moments.
            </p>
          </div>
        </div>
      )}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">
            Create Survey
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
                    Create New
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>
    <div>
      <Card className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <CardContent className="p-6">
          <div className="mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col space-y-1">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-1">Set Up Your Survey</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Let’s get started! Fill in the details below to build your new survey.
              </p>
            </div>
          </div>
          <Form {...form}>
            <form onSubmit={(e) => handleFormSubmit(e)} className="space-y-8" noValidate>
              {/* Survey Title */}
              <FormField
                control={form.control}
                name="surveyTitle"
                render={({ field }) => (
                  <FormItem className="space-y-2 mb-4">
                      <div className="flex items-center justify-between">
                        <FormLabel className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-200">
                          Survey Name
                          <span className="text-destructive ml-1">*</span>
                        </FormLabel>
                        {/* {field.value && !form.formState.errors.surveyTitle && (
                          <span className="inline-flex items-center text-xs text-green-500">
                            <svg className="w-3.5 h-3.5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Looks good!
                          </span>
                        )} */}
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            placeholder="e.g., Customer Satisfaction Survey 2023" 
                            {...field} 
                            required
                            className={`w-full px-3 py-2 text-gray-900 bg-white dark:bg-gray-700 dark:text-white border ${
                            form.formState.errors.surveyTitle 
                              ? 'border-red-400 dark:border-red-500 focus:ring-red-500 focus:border-red-500' 
                              : 'border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400'
                          } rounded-md focus:ring-1 focus:ring-opacity-50 transition-all duration-200`}
                            onChange={(e) => {
                              field.onChange(e);
                              form.trigger("surveyTitle");
                            }}
                          />
                        </div>
                      </FormControl>
                      <FormMessage className="text-sm text-red-500 dark:text-red-400" />
                  </FormItem>
                )}
              />

              {/* Survey Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="space-y-2 mb-4">
                      <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Description
                        {/* <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">(optional)</span> */}
                      </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Provide a brief description of your survey..."
                        className="min-h-[100px] resize-y text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 rounded-md focus:ring-1 focus:ring-opacity-50 focus:ring-blue-200 dark:focus:ring-blue-800 transition-all duration-200"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-sm text-red-500 dark:text-red-400" />
                  </FormItem>
                )}
              />

              {/* File Upload */}
              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem className="space-y-2 mb-4">
                      <FormLabel className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Upload PDF
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                    <FormControl>
                      <div className="mt-1">
                        <FileUpload
                          value={field.value}
                          onChange={(files) => {
                            field.onChange(files);
                          }}
                          multiple={false}
                          maxFiles={1}
                          accept={{"application/pdf": [".pdf"]}}
                          className="w-full"
                        />
                      </div>
                    </FormControl>
                    <FormMessage className="text-sm text-red-500 dark:text-red-400" />
                    <FormDescription className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload a single PDF file (max 5MB)</span>
                    </FormDescription>
                  </FormItem>
                )}
              />
           
              <div className="pt-4 border-t border-gray-100 dark:border-gray-700 mt-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {/* <p>All fields marked with <span className="text-red-500">*</span> are required</p> */}
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => form.reset()}
                      className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all duration-200"
                    >
                      Reset Form
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-6 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-500 rounded-md shadow-sm transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          Create Survey
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      </div>
    </div>
</div>
  );
}