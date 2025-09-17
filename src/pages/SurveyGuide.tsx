import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { Loader } from "@/components/ui/Loader";
import { useLoader } from "@/hooks/useLoader";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
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
  const { showLoader, hideLoader } = useLoader();
  
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
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log('=== Form Submission ===');
    console.log('Form values:', values);
    
    // Log file information
    if (values.files && values.files.length > 0) {
      console.log('Files:', values.files.map(file => ({
        name: file.name,
        type: file.type,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        lastModified: new Date(file.lastModified).toLocaleString()
      })));
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
          <h2 className="text-xl font-bold tracking-tight !text-[#374151] dark:!text-gray-200">Create Survey</h2>
          
          <p className="text-muted-foreground text-base text-sm mt-2">
            Create and customize your survey with ease
          </p>
        </div>
      </div>
    <div className="h-full">
      <Card>
        
        <CardContent className="p-8 mt-3">
          <Form {...form}>
            <form onSubmit={(e) => handleFormSubmit(e)} className="space-y-8" noValidate>
              {/* Survey Title */}
              <FormField
                control={form.control}
                name="surveyTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center">
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
                    <FormLabel>Description</FormLabel>
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
                    <FormLabel className="flex items-center">
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
           
              <div className="flex justify-end pt-6 border-t">
                <div className="flex space-x-3">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => form.reset()}
                  >
                    Reset Form
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={form.formState.isSubmitting}
                  >
                    {form.formState.isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Create Survey
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
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
