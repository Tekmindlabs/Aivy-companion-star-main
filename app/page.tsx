import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";

export default async function Home() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Personal AI tutor</h1>
        <p className="text-xl text-muted-foreground">
          Your personal AI-powered learning tutor
        </p>
        
        <div className="my-8">
          <img 
            src="/hero-image.png" 
            alt="AI tutor Hero" 
            className="max-w-2xl mx-auto"
          />
        </div>

        <div className="flex gap-4 justify-center">
          <AuthDialog mode="signup">
            <Button size="lg" variant="default">
              Start Learning
            </Button>
          </AuthDialog>

          <AuthDialog mode="signin">
            <Button size="lg" variant="outline">
              Login
            </Button>
          </AuthDialog>
        </div>
      </div>
    </div>
  );
}