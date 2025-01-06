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

type GDPRConsentProps = {
  initialData: any;
  onNext: (data: any) => void;
};

export function GDPRConsent({ initialData, onNext }: GDPRConsentProps) {
  const form = useForm({
    resolver: zodResolver(userDetailsSchema.pick({ gdprConsent: true })),
    defaultValues: initialData,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
        <div className="prose dark:prose-invert max-w-none">
          <h2>Privacy Policy & Data Processing Consent</h2>
          <p>By using our AI tutor service, you agree to:</p>
          <ul>
            <li>The collection and processing of your personal data</li>
            <li>The storage of your chat history for service improvement</li>
            <li>The analysis of your learning patterns to personalize content</li>
          </ul>
          <p>You have the right to:</p>
          <ul>
            <li>Access your personal data</li>
            <li>Request data deletion</li>
            <li>Export your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
        </div>

        <FormField
          control={form.control}
          name="gdprConsent"
          render={({ field }) => (
            <FormItem className="flex items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <FormLabel className="text-sm font-normal leading-none">
                I consent to the processing of my personal data as described in the privacy policy
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Complete Onboarding
        </Button>
      </form>
    </Form>
  );
}