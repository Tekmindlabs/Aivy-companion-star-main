import { AuthDialog } from "@/components/auth/auth-dialog";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen">
      <AuthDialog mode="signin">
        <Button size="lg" variant="default">
          Sign In
        </Button>
      </AuthDialog>
    </div>
  );
}