import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { ArrowRight, Plus, Trash2, Upload } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";

// Form validation schema
const formSchema = z.object({
  surveyTitle: z.string().min(5, {
    message: "Survey title must be at least 5 characters.",
  }),
  description: z.string().optional(),
  files: z
    .array(z.any())
    .min(1, {
      message: "At least one file is required.",
    })
    .refine((files) => files.every((file) => file.size <= 5 * 1024 * 1024), {
      message: "Each file must be less than 5MB.",
    }),
  questions: z.array(
    z.object({
      text: z.string().min(5, {
        message: "Question text is required.",
      }),
      type: z.enum(["text", "multiple_choice", "single_choice", "rating"]),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
    })
  ).min(1, {
    message: "At least one question is required.",
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
  // Add a container with consistent padding to match other dashboard pages
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      surveyTitle: "",
      description: "",
      files: [],
      questions: [
        {
          text: "",
          type: "text",
          required: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "questions",
  });

  const addQuestion = () => {
    append({
      text: "",
      type: "text",
      required: false,
    });
  };

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    console.log(values);
    // Handle form submission
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight">Create New Survey</h2>
        <p className="text-muted-foreground">
          Fill in the details below to create your survey
        </p>
      </div>
    <div className="h-full">
      <Card>
        
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                        required
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
                    <FormLabel>Description (Optional)</FormLabel>
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
                        onChange={field.onChange}
                        multiple={true}
                        maxFiles={5}
                        className="mt-1"
                      />
                    </FormControl>
                    <FormMessage />
                    <FormDescription>
                      Upload any supporting documents (PDF, DOC, DOCX, images) up to 5MB each.
                    </FormDescription>
                  </FormItem>
                )}
              />
           
              <div className="flex justify-end space-x-4 pt-4">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
                <Button type="submit">
                  Create Survey
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </div>
  );
}
