import { getSession } from '@/lib/auth'
import { redirect } from 'next/navigation'


export default async function KnowledgeGraphLayout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session?.user) {
    redirect('/sign-in')
  }

  return (
    <div className="flex-1 flex flex-col">
      {children}
    </div>
  )
}