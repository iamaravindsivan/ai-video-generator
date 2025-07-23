import { z } from 'zod';
import { USER_ROLES } from '@/lib/constants';

export const EmailSchema = z.string().email('Invalid email address');
export const FullNameSchema = z.string().min(1, 'Full name is required').max(100, 'Full name is too long');

export const UserRoleSchema = z.enum([USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER]);

export const CreateUserSchema = z.object({
  email: EmailSchema,
  fullName: FullNameSchema,
  roles: z.array(UserRoleSchema).optional().default([USER_ROLES.USER]),
});

export const UpdateUserSchema = z.object({
  email: EmailSchema.optional(),
  fullName: FullNameSchema.optional(),
  roles: z.array(UserRoleSchema).optional(),
});

export const UpdateAccountSchema = z.object({
  fullName: FullNameSchema,
});

export const UserDbSchema = z.object({
  _id: z.any().optional(),
  email: EmailSchema,
  fullName: FullNameSchema,
  roles: z.array(UserRoleSchema),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().optional(),
}); 