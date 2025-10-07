import type { User } from '@prisma/client';
import { UserDropdown } from '../auth/user-dropdown';
import { ThemeToggle } from '../theme-toggle';

interface HeaderProps {
    user: User | null;
}

export function Header({ user }: HeaderProps) {
    return (
        <header className="flex h-20 items-center justify-between border-b bg-background px-4 md:px-6">
            <h1 className="font-headline text-2xl font-bold text-primary">ShiftSync</h1>
            <div className="flex items-center gap-4">
                <ThemeToggle />
                {user && <UserDropdown user={user} />}
            </div>
        </header>
    )
}
