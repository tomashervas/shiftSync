import type { User } from '@prisma/client';
import { UserDropdown } from '../auth/user-dropdown';
import { ThemeToggle } from '../theme-toggle';
import { Settings2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../ui/button';


interface HeaderProps {
    user: User | null;
}

export function Header({ user }: HeaderProps) {
    return (
        <header className="flex h-20 items-center justify-between border-b bg-background px-4 md:px-6">
            <h1 className="font-headline text-2xl font-bold text-primary">ShiftSync</h1>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                <Link  className='w-10 h-10 hover:bg-accent hover:text-accent-foreground inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0' href="/setup">
                    <Settings2 className="h-[1.2rem] w-[1.2rem]" /> 
                </Link>
                {user && <UserDropdown user={user} />}
            </div>  
        </header>
    )
}
