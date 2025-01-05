import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({})
export class MongooseRootModule {
  static forRoot(): DynamicModule {
    return {
      module: MongooseRootModule,
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('database.host'),
            dbName: configService.get<string>('database.db_name'),
          }),
          inject: [ConfigService],
        }),
      ],
    };
  }
}
