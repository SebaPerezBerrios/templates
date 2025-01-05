import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { z } from 'zod';
import { mongoId } from '../../../utils/types';

@Schema({ _id: false, timestamps: false })
export class Resource {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: [String], default: [] })
  actions!: string[];
}

export const ResourceSchema = SchemaFactory.createForClass(Resource);

@Schema({ timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } })
export class Role {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ required: true, type: [{ type: ResourceSchema }], default: [] })
  resources!: Resource[];

  created_at!: Date;
  updated_at!: Date;
}

export type RoleDocument = HydratedDocument<Role>;

export const RoleSchema = SchemaFactory.createForClass(Role);

export const RoleCachedDocument = z.object({
  _id: mongoId,
  name: z.string(),
  label: z.string(),
  resources: z.array(z.object({ name: z.string(), actions: z.array(z.string()) })),
  created_at: z.date({ coerce: true }),
  updated_at: z.date({ coerce: true }),
});

export type RoleCachedDocument = z.infer<typeof RoleCachedDocument>;
