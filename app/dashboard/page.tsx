import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Card } from "@/components/ui/card";

export default async function Dashboard() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect("/auth/signin");
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Welcome, {session.user.name}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Recent Activity</h2>
          <p className="text-muted-foreground">Start your learning journey</p>
        </Card>
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-2">Progress</h2>
          <p className="text-muted-foreground">Track your achievements</p>
        </Card>
      </div>
    </div>
  );
}