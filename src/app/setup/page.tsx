import { redirect } from 'next/navigation';
import { auth } from '../../auth';
import { prisma } from '@/lib/prisma';
import { ShiftSetupForm } from '@/components/setup/shift-setup-form';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

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
  );
}
