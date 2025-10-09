'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { auth } from '../auth';
import { prisma } from './prisma';

const shiftTypeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Name is required'),
  hours: z.coerce.number().int().min(0, 'Hours must be a positive number'),
});

const saveShiftTypesSchema = z.array(shiftTypeSchema);

export async function saveShiftTypes(formData: z.infer<typeof saveShiftTypesSchema>) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: 'Not authenticated' };
  }

  const validatedData = saveShiftTypesSchema.safeParse(formData);

  if (!validatedData.success) {
    return { error: 'Invalid data' };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // Delete old shifts
      await tx.shiftType.deleteMany({
        where: {
          userId: session.user!.id,
          NOT: {
            name: { in: validatedData.data.map(d => d.name) }
          }
        }
      });

      // Upsert new/updated shifts
      for (const shift of validatedData.data) {
        await tx.shiftType.upsert({
          where: {
            userId_name: {
              userId: session.user!.id,
              name: shift.name,
            },
          },
          update: { hours: shift.hours },
          create: {
            name: shift.name,
            hours: shift.hours,
            userId: session.user!.id,
          },
        });
      }
      
      // Mark user as onboarded
      await tx.user.update({
        where: { id: session.user!.id },
        data: { onboarded: true },
      });
    });
  } catch (error) {
    console.error(error);
    return { error: 'Failed to save shift types.' };
  }

  revalidatePath('/');
  return { success: true };
}

const assignShiftSchema = z.object({
  date: z.string().date(),
  shiftTypeId: z.string().cuid().nullable(),
  userId: z.string().cuid(),
  isChange: z.boolean().optional(),
  observations: z.string().optional(),
});

export async function assignShift(data: z.infer<typeof assignShiftSchema>) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.id !== data.userId) {
      return { error: 'Not authenticated' };
    }

    const validatedData = assignShiftSchema.safeParse(data);
    if (!validatedData.success) {
      return { error: 'Invalid data' };
    }

    const { date, shiftTypeId, userId, isChange, observations } = validatedData.data;

    let result;
    
    if (shiftTypeId === null) {
      result = await prisma.shiftAssignment.delete({
        where: {
          userId_date: {
            userId,
            date: new Date(date),
          },
        },
        include: {
          shiftType: true,
          originalShiftType: true,
        },
      }).catch(() => null);
    } else {
      const existingAssignment = await prisma.shiftAssignment.findUnique({
        where: {
          userId_date: {
            userId,
            date: new Date(date),
          },
        },
      });

      let originalShiftTypeId = existingAssignment?.originalShiftTypeId;

      if (isChange && existingAssignment && existingAssignment.shiftTypeId !== shiftTypeId) {
        if (!originalShiftTypeId) {
          originalShiftTypeId = existingAssignment.shiftTypeId;
        }
      } 

      if (shiftTypeId === originalShiftTypeId) {
        originalShiftTypeId = null;
      }

      result = await prisma.shiftAssignment.upsert({
        where: {
          userId_date: {
            userId,
            date: new Date(date),
          },
        },
        update: { 
          shiftTypeId, 
          observations,
          originalShiftTypeId
        },
        create: {
          userId,
          date: new Date(date),
          shiftTypeId,
          observations,
          originalShiftTypeId
        },
        include: {
          shiftType: true,
          originalShiftType: true,
        },
      });
    }
    
    revalidatePath('/');
    return { success: true, data: result };
    
  } catch (error) {
    console.error('Error en assignShift:', error);
    return { error: 'Failed to assign shift' };
  }
}

export async function getMonthAssignments(date: Date, userId: string) {
    // Ajustar las fechas de inicio y fin del mes
    const start = new Date(date.getFullYear(), date.getMonth(), 1, 12);
    const end = new Date(date.getFullYear(), date.getMonth() + 1, 0, 12);

    const assignments = await prisma.shiftAssignment.findMany({
        where: {
            userId,
            date: {
                gte: start,
                lte: end,
            },
        },
        include: {
            shiftType: true,
            originalShiftType: true,
        },
    });
    
    // Asegurar que todas las fechas tengan la hora correcta
    return assignments.map(assignment => ({
        ...assignment,
        date: new Date(new Date(assignment.date).setHours(12))
    }));
}
