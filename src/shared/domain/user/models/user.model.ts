import { Prop, SchemaFactory } from '@nestjs/mongoose';
import { Schema } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';
import { z } from 'zod';
import { mongoId } from '../../../utils/types/dtos';
import { TenantCachedDocument } from '../../tenant';
import { RoleCachedDocument } from './role.model';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ index: true, type: mongoose.Schema.Types.ObjectId, ref: 'Role' })
  role_id?: Types.ObjectId;

  @Prop({
    required: true,
    index: true,
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' }],
    default: [],
  })
  tenant_ids!: Types.ObjectId[];

  @Prop({ required: true, default: true, index: true })
  is_active!: boolean;
}

export type UserDocument = HydratedDocument<User>;

export const UserSchema = SchemaFactory.createForClass(User);

export const UserCachedDocument = z.object({
  _id: mongoId,
  email: z.string(),
  name: z.string(),
  role_id: mongoId.optional(),
  role: RoleCachedDocument.optional(),
  tenant_ids: z.array(mongoId),
  tenants: z.array(TenantCachedDocument),
  is_active: z.boolean(),
  created_at: z.date({ coerce: true }),
  updated_at: z.date({ coerce: true }),
  auth_scopes: z.array(z.string()),
});

export type UserCachedDocument = z.infer<typeof UserCachedDocument>;
