"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";

interface InterestsEditFormProps {
  user: User;
  onComplete: () => void;
}

const interestsSchema = z.object({
  interests: z.array(z.string()).min(1, "Please select at least one interest")
});

export function InterestsEditForm({ user, onComplete }: InterestsEditFormProps) {
  const form = useForm({
    resolver: zodResolver(interestsSchema),
    defaultValues: {
      interests: user.interests || []
    }
  });

  async function onSubmit(data: z.infer<typeof interestsSchema>) {
    try {
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to update interests");

      toast({
        title: "Interests updated",
        description: "Your interests have been successfully updated.",
      });
      onComplete();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update interests. Please try again.",
        variant: "destructive",
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="interests"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Interests</FormLabel>
              <FormControl>
                {/* Add your interests selection UI here */}
                {/* This could be checkboxes, multi-select, or tags input */}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Save Interests</Button>
      </form>
    </Form>
  );
}