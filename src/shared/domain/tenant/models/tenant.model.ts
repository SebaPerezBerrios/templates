import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { mongoId } from '../../../utils/types/dtos';
import { HydratedDocument } from 'mongoose';
import * as z from 'zod';

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Tenant {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true, default: true, index: true })
  is_active!: boolean;

  created_at!: Date;
  updated_at!: Date;
}

export type TenantDocument = HydratedDocument<Tenant>;

export const TenantSchema = SchemaFactory.createForClass(Tenant);

export const TenantCachedDocument = z.object({
  _id: mongoId,
  name: z.string(),
  label: z.string(),
  is_active: z.boolean(),
  created_at: z.date({ coerce: true }),
  updated_at: z.date({ coerce: true }),
});

export type TenantCachedDocument = z.infer<typeof TenantCachedDocument>;
