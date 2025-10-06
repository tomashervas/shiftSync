import { redirect } from 'next/navigation';
import Image from 'next/image';
import { auth } from '../auth';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { SignIn } from '@/components/auth/signin-button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { CalendarView } from '@/components/calendar/calendar-view';
import { Header } from '@/components/shared/header';
import { getMonthAssignments } from '@/lib/actions';

function LandingPage() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'landing-hero');

  return (
    <div className="flex min-h-screen flex-col">
      <header className="container mx-auto flex h-20 items-center justify-between px-4">
        <h1 className="font-headline text-2xl font-bold text-primary">ShiftSync</h1>
      </header>
      <main className="flex-1">
        <section className="container mx-auto grid grid-cols-1 items-center gap-12 px-4 py-16 md:grid-cols-2 lg:py-24">
          <div className="space-y-6">
            <h2 className="font-headline text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Organize Your Nursing Shifts, Effortlessly.
            </h2>
            <p className="text-lg text-muted-foreground">
              ShiftSync is a modern, intuitive tool designed for nurses to manage their work schedule with ease. Track hours, plan your month, and focus on what truly matters.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <SignIn />
            </div>
          </div>
          <div className="relative h-80 w-full overflow-hidden rounded-lg shadow-2xl md:h-96">
            {heroImage && (
              <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                fill
                className="object-cover"
                data-ai-hint={heroImage.imageHint}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/50 to-transparent" />
          </div>
        </section>
      </main>
    </div>
  );
}

async function Dashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/');
  }

  const [user, shiftTypes, initialAssignments] = await Promise.all([
    prisma.user.findUnique({ where: { id: session.user.id } }),
    prisma.shiftType.findMany({ where: { userId: session.user.id } }),
    getMonthAssignments(new Date(), session.user.id)
  ]);
  
  const totalHours = initialAssignments.reduce((acc, assignment) => acc + assignment.shiftType.hours, 0);

  return (
    <div className="flex min-h-screen flex-col bg-secondary/50 dark:bg-background">
      <Header user={user} totalHours={totalHours} />
      <main className="flex-1 p-4 md:p-6 lg:p-8">
        <CalendarView
          userId={user!.id}
          shiftTypes={shiftTypes}
          initialAssignments={initialAssignments}
        />
      </main>
    </div>
  );
}

export default async function HomePage() {
  const session = await auth();
  if (!session?.user) {
    return <LandingPage />;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { onboarded: true },
  });

  if (!user?.onboarded) {
    redirect('/setup');
  }

  return <Dashboard />;
}
