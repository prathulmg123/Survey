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
    .min(5, { message: "Survey title must be at least 5 characters" })
    .max(100, { message: "Survey title cannot exceed 100 characters" })
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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showLoader, hideLoader } = useLoader();
  const navigate = useNavigate();
  
  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onBlur',
    defaultValues: {
      surveyTitle: "",
      description: "",
      files: [] as unknown as FileWithPreview[] // Initialize as empty array
    },
  });

  // Handle loading state
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

  // Show loading state
  if (isLoading) {
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
        toast.success('Survey created successfully!');
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
    <div className="h-full">
      <Card className="bg-white dark:bg-gray-800 shadow rounded-lg">
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={(e) => handleFormSubmit(e)} className="space-y-8" noValidate>
              {/* Survey Title */}
              <FormField
                control={form.control}
                name="surveyTitle"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel className="flex items-center text-gray-700 dark:text-gray-300">
                        Survey Name
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter survey name" 
                        {...field} 
                        required={false}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Survey Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel className="text-gray-700 dark:text-gray-300">Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter survey description"
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* File Upload */}
              <FormField
                control={form.control}
                name="files"
                render={({ field }) => (
                  <FormItem>
                      <FormLabel className="flex items-center text-gray-700 dark:text-gray-300">
                        Upload Files
                        <span className="text-destructive ml-1">*</span>
                      </FormLabel>
                    <FormControl>
                      <FileUpload
                        value={field.value}
                        onChange={(files) => {
                          // The FileUpload component gives us FileWithPreview[]
                          field.onChange(files);
                        }}
                        multiple={false}
                        maxFiles={1}
                        accept={{"application/pdf": [".pdf"]}}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Upload a single PDF file. Maximum file size: 5MB
                    </FormDescription>
                  </FormItem>
                )}
              />
           
              <div className="flex justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => form.reset()}
                    className="text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                  >
                    Reset Form
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-blue-700/90 hover:bg-blue-700/90 text-white"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Survey'
                    )}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
