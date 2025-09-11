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
    <div className="h-full">
      <Card className="border-0 shadow-sm h-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Survey</CardTitle>
          <p className="text-muted-foreground">
            Fill in the details below to create your survey
          </p>
        </CardHeader>
        <CardContent>
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

              {/* Questions */}
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Questions</h3>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addQuestion}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4 border border-gray-200">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium">Question {index + 1}</h4>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Question Text */}
                    <FormField
                      control={form.control}
                      name={`questions.${index}.text`}
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <FormControl>
                            <Input
                              placeholder="Enter your question"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Question Type */}
                    <FormField
                      control={form.control}
                      name={`questions.${index}.type`}
                      render={({ field }) => (
                        <FormItem className="mb-4">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select question type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {questionTypes.map((type) => (
                                <SelectItem key={type.id} value={type.id}>
                                  {type.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Options for multiple/single choice */}
                    {form.watch(`questions.${index}.type`) === "multiple_choice" ||
                    form.watch(`questions.${index}.type`) === "single_choice" ? (
                      <div className="space-y-2 mb-4">
                        <FormLabel>Options</FormLabel>
                        {form.watch(`questions.${index}.options`)?.map(
                          (_, optionIndex) => (
                            <div
                              key={optionIndex}
                              className="flex items-center space-x-2"
                            >
                              <Input
                                placeholder={`Option ${optionIndex + 1}`}
                                {...form.register(
                                  `questions.${index}.options.${optionIndex}`
                                )}
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive"
                                onClick={() => {
                                  const options = form.getValues(
                                    `questions.${index}.options`
                                  );
                                  const newOptions = options?.filter(
                                    (_, i) => i !== optionIndex
                                  );
                                  form.setValue(
                                    `questions.${index}.options`,
                                    newOptions || []
                                  );
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )
                        )}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            const options = form.getValues(
                              `questions.${index}.options`
                            ) || [];
                            form.setValue(
                              `questions.${index}.options`,
                              [...options, ""]
                            );
                          }}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add Option
                        </Button>
                      </div>
                    ) : null}

                    {/* Required Toggle */}
                    <FormField
                      control={form.control}
                      name={`questions.${index}.required`}
                      render={({ field }) => (
                        <FormItem className="flex items-center space-x-2">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="!mt-0">Required</FormLabel>
                        </FormItem>
                      )}
                    />
                  </Card>
                ))}
              </div>

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
  );
}
