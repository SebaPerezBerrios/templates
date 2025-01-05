import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';

@Injectable()
export class MongoIdPipe implements PipeTransform {
  transform(value: string) {
    if (Types.ObjectId.isValid(value)) return new Types.ObjectId(value);
    throw new BadRequestException(`Id ${value} is not a valid MongoDB id`);
  }
}
