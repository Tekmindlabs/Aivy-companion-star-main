"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userDetailsSchema } from "@/lib/validations/onboarding";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const INTERESTS = [
  "Mathematics",
  "Science",
  "Programming",
  "Languages",
  "History",
  "Arts",
  "Music",
  "Literature",
];

type InterestsFormProps = {
  initialData: any;
  onNext: (data: any) => void;
};

export function InterestsForm({ initialData, onNext }: InterestsFormProps) {
  const form = useForm({
    resolver: zodResolver(userDetailsSchema.pick({ interests: true })),
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <FormField
          control={form.control}
          name="interests"
          render={() => (
            <FormItem>
              <FormLabel>Select your interests</FormLabel>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {INTERESTS.map((interest) => (
                  <FormField
                    key={interest}
                    control={form.control}
                    name="interests"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(interest)}
                            onCheckedChange={(checked) => {
                              const value = field.value || [];
                              if (checked) {
                                field.onChange([...value, interest]);
                              } else {
                                field.onChange(value.filter((i: string) => i !== interest));
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="text-sm font-normal">
                          {interest}
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Next
        </Button>
      </form>
    </Form>
  );
}