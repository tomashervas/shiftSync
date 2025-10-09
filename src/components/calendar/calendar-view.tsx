'use client';

import * as React from 'react';
import type { ShiftType, ShiftAssignment } from '@prisma/client';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  isToday,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { InputText } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { assignShift, getMonthAssignments } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

type AssignmentWithShiftType = ShiftAssignment & { 
  shiftType: ShiftType, 
  originalShiftType?: ShiftType | null 
};

interface CalendarViewProps {
  userId: string;
  shiftTypes: ShiftType[];
  initialAssignments: AssignmentWithShiftType[];
}

const weekStartsOn = 1; // Monday

export function CalendarView({ userId, shiftTypes, initialAssignments }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [assignments, setAssignments] = React.useState(initialAssignments);
  const [isLoading, setIsLoading] = React.useState(false);
  const [openPopoverId, setOpenPopoverId] = React.useState<string | null>(null);
  const [isChange, setIsChange] = React.useState(false);
  const [observations, setObservations] = React.useState('');
  
  const { toast } = useToast();
  const router = useRouter();

  const start = startOfMonth(currentDate);
  const end = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start, end });

  const firstDayOfWeek = getDay(start);
  const paddingDays = (firstDayOfWeek - weekStartsOn + 7) % 7;

  const handleAssignShift = async (date: Date, shiftTypeId: string | null) => {
    setIsLoading(true);
    try {
      const adjustedDate = new Date(date);
      adjustedDate.setHours(12);
      
      const result = await assignShift({
        date: adjustedDate.toISOString().split('T')[0],
        shiftTypeId,
        userId,
        isChange,
        observations
      });
      
      if (result?.error) {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive'
        });
        return;
      }

      if (result.success) {
        if (shiftTypeId === null) {
          setAssignments(prev => prev.filter(a => !isSameDay(a.date, date)));
        } else if (result.data) {
          setAssignments(prev => {
            const filtered = prev.filter(a => !isSameDay(a.date, date));
            return result.data ? [...filtered, result.data] : filtered;
          });
        }
        router.refresh();
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Hubo un error al asignar el turno',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setOpenPopoverId(null);
      setIsChange(false);
      setObservations('');
    }
  };

  React.useEffect(() => {
    const fetchAssignments = async () => {
      const newAssignments = await getMonthAssignments(currentDate, userId);
      setAssignments(newAssignments);
    };
    fetchAssignments();
  }, [currentDate, userId]);

  const totalHours = assignments.reduce((acc, assignment) => acc + assignment.shiftType.hours, 0);

  const getShiftColorClasses = (shiftName: string) => {
    switch (shiftName) {
      case 'Mañana':
        return 'bg-blue-500/10 text-blue-800 dark:text-blue-200 hover:bg-blue-500/20';
      case 'Tarde':
        return 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-500/20';
      case 'Día':
        return 'bg-amber-500/10 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20';
      case 'Noche':
        return 'bg-fuchsia-500/10 text-fuchsia-800 dark:text-fuchsia-200 hover:bg-fuchsia-500/20';
      case '24h':
        return 'bg-red-500/10 text-red-800 dark:text-red-200 hover:bg-red-500/20';
      case 'Libre':
        return 'bg-gray-500/10 dark:bg-gray-200/50 text-gray-800 dark:text-gray-200 hover:bg-gray-500/20';
      default:
        return 'bg-violet-500/10 text-violet-800 dark:text-violet-200 hover:bg-violet-500/20';
    }
  };

  const handlePopoverOpenChange = (isOpen: boolean, day: Date) => {
    setOpenPopoverId(isOpen ? day.toString() : null);
    if (isOpen) {
      const assignment = assignments.find((a) => isSameDay(a.date, day));
      setObservations(assignment?.observations || '');
      setIsChange(!!assignment?.originalShiftTypeId);
    }
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex items-center justify-between p-4">
        <h2 className="font-headline text-2xl">{format(currentDate, 'MMMM yyyy', { locale: es })} 
          { totalHours > 0 && <span className="text-lg font-semibold text-muted-foreground ml-4">({totalHours} horas)</span> }
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setCurrentDate(new Date())}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 border-t">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>      
      <div className="grid grid-cols-7">
        {Array.from({ length: paddingDays }).map((_, i) => (
          <div key={`pad-${i}`} className="border-b border-r" />
        ))}
        {days.map((day, i) => {
          const assignment = assignments.find((a) => isSameDay(a.date, day));
          const isShiftChanged = assignment?.originalShiftTypeId && assignment.shiftTypeId !== assignment.originalShiftTypeId;

          return (
            <div
              key={day.toString()}
              className={cn(
                'relative h-24 md:h-32 p-2 border-b border-r flex flex-col',
                !isSameMonth(day, currentDate) && 'bg-muted/50 text-muted-foreground',
                i % 7 === 6 && 'border-r-0'
              )}
            >
              <div className="flex justify-between items-center">
                <time
                  dateTime={format(day, 'yyyy-MM-dd')}
                  className={cn('text-sm font-medium', isToday(day) && 'flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground')}
                >
                  {format(day, 'd')}
                </time>
                {isShiftChanged && assignment.originalShiftType && (
                  <div className={cn("text-xs font-bold flex items-center gap-1 p-1 rounded-md text-center", getShiftColorClasses(assignment.originalShiftType.name))}>
                    C
                    <span className={cn("flex items-center justify-center h-4 w-4 rounded-full text-xs", getShiftColorClasses(assignment.originalShiftType.name))}>
                      {assignment.originalShiftType.name.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              
              <Popover open={openPopoverId === day.toString()} onOpenChange={(isOpen) => handlePopoverOpenChange(isOpen, day)}>
                <PopoverTrigger asChild>
                  {assignment ? (
                     <div className={cn(
                        "mt-1 flex-1 cursor-pointer rounded-md p-1 text-xs font-semibold transition-colors flex flex-col items-center justify-center text-center",
                        getShiftColorClasses(assignment.shiftType.name)
                      )}>
                        <span>{assignment.shiftType.name} {assignment.shiftType.hours > 0 ? '(' + assignment.shiftType.hours + 'h)': ''}</span>
                        {assignment.observations && <span className="text-xs italic opacity-75 mt-1">{assignment.observations}</span>}
                    </div>
                  ) : (
                    <div className="mt-1 flex-1 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                            <Plus className="h-4 w-4 text-muted-foreground"/>
                         </Button>
                    </div>
                  )}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2">
                    <div className="flex flex-col">
                        {shiftTypes.map((shift) => (
                            <Button 
                              key={shift.id} 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleAssignShift(day, shift.id)}
                              disabled={isLoading}
                            >
                                {shift.name} ({shift.hours}h)
                            </Button>
                        ))}
                        
                        {assignment && (
                          <div className="flex items-center space-x-2 mt-2">
                            <Checkbox id="is-change" checked={isChange} onCheckedChange={(checked) => setIsChange(!!checked)} />
                            <Label htmlFor="is-change">Es un cambio</Label>
                          </div>
                        )}

                        <div className="mt-2">
                          <Label htmlFor="observations">Observaciones</Label>
                          <InputText id="observations" value={observations} onChange={(e) => setObservations(e.target.value)} />
                        </div>

                        {assignment && (
                            <>
                                <hr className="my-1"/>
                                <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleAssignShift(day, null)}>
                                    <X className="mr-2 h-4 w-4"/>
                                    Quitar Turno
                                </Button>
                            </>
                        )}
                    </div>
                </PopoverContent>
              </Popover>
            </div>
          );
        })}
      </div>
    </div>
  );
}
