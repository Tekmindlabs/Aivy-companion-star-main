"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

type AuthDialogProps = {
  children: React.ReactNode;
  mode: "signin" | "signup";
};

export function AuthDialog({ children, mode }: AuthDialogProps) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSocialSignIn = (provider: string) => {
    signIn(provider, {
      callbackUrl: mode === "signup" ? "/onboarding" : "/dashboard",
    });
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("email", {
        email,
        redirect: false,
        callbackUrl: mode === "signup" ? "/onboarding" : "/dashboard",
      });

      if (result?.error) {
        // Handle error
        console.error(result.error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <div className="flex flex-col space-y-6 py-6">
          <div className="flex flex-col space-y-2 text-center">
            <h3 className="text-2xl font-semibold">
              {mode === "signin" ? "Welcome back" : "Get started"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {mode === "signin" 
                ? "Sign in to your account to continue" 
                : "Create an account to start learning"
              }
            </p>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Continue with Email
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-col space-y-4">
            <Button
              variant="outline"
              onClick={() => handleSocialSignIn("google")}
            >
              <Icons.google className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleSocialSignIn("facebook")}
            >
              <Icons.facebook className="mr-2 h-4 w-4" />
              Continue with Facebook
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}