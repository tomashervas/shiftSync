'use client';

import { useRouter } from 'next/navigation';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { saveShiftTypes } from '@/lib/actions';
import { PlusCircle, Trash2 } from 'lucide-react';

const shiftSchema = z.object({
  name: z.string().min(1, { message: 'Shift name is required.' }),
  hours: z.coerce.number().min(0, { message: 'Hours must be a positive number.' }),
});

const formSchema = z.object({
  shifts: z.array(shiftSchema),
});

type ShiftSetupFormValues = z.infer<typeof formSchema>;

const defaultShifts = [
  { name: 'Mañana', hours: 8 },
  { name: 'Tarde', hours: 8 },
  { name: 'Día', hours: 12 },
  { name: 'Noche', hours: 12 },
  { name: '24h', hours: 24 },
];

export function ShiftSetupForm({ initialShifts }: { initialShifts?: { name: string, hours: number }[] }) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<ShiftSetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      shifts: initialShifts && initialShifts.length > 0 ? initialShifts : defaultShifts,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'shifts',
  });

  async function onSubmit(data: ShiftSetupFormValues) {
    const result = await saveShiftTypes(data.shifts);
    if (result?.error) {
      toast({
        title: 'Error',
        description: result.error,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Success!',
        description: 'Your shift types have been saved.',
      });
      router.push('/');
      router.refresh();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
              <div className="col-span-12 sm:col-span-5">
                <FormField
                  control={form.control}
                  name={`shifts.${index}.name`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Shift Name</FormLabel>}
                      <FormControl>
                        <Input placeholder="e.g., Morning" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-12 sm:col-span-5">
                <FormField
                  control={form.control}
                  name={`shifts.${index}.hours`}
                  render={({ field }) => (
                    <FormItem>
                      {index === 0 && <FormLabel>Hours</FormLabel>}
                      <FormControl>
                        <Input type="number" placeholder="e.g., 8" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-12 sm:col-span-2 flex items-end h-full">
                 {index === 0 && <FormLabel className="sm:hidden">&nbsp;</FormLabel>}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => remove(index)}
                  disabled={fields.length <= 1}
                >
                  <Trash2 className="h-5 w-5" />
                   <span className="sr-only">Remove shift</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center">
          <Button
            type="button"
            variant="outline"
            onClick={() => append({ name: '', hours: 8 })}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Shift
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save and Continue'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
