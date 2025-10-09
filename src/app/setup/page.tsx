import { redirect } from 'next/navigation';
import { auth } from '../../auth';
import { prisma } from '@/lib/prisma';
import { ShiftSetupForm } from '@/components/setup/shift-setup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function SetupPage() {
  const session = await auth();
  if (!session?.user) {
    redirect('/');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { shiftTypes: true },
  });

  // if (user?.onboarded) {
  //   redirect('/');
  // }

  return (
    <div className="min-h-screen w-full">
      <div className='bg-muted/40'>
        <Link  href="/"  className='w-10 h-10 hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0'>
            <ArrowLeft className="h-[1.2rem] w-[1.2rem]" /> 
        </Link>
      </div>
      <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Welcome to ShiftSync!</CardTitle>
            <CardDescription>
              Let's get your account set up. Please define your standard shift types and their corresponding hours. You can always change these later.
            </CardDescription>
          </CardHeader>
          <Separator className="mb-6" />
          <CardContent>
            <ShiftSetupForm initialShifts={user?.shiftTypes} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
