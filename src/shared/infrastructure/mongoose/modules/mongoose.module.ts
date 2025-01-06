import { DynamicModule, InternalServerErrorException, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({})
export class MongooseRootModule {
  static forRoot(): DynamicModule {
    return {
      module: MongooseRootModule,
      imports: [
        MongooseModule.forRootAsync({
          useFactory: async (configService: ConfigService) => {
            const mongooseConfig = configService.get<{ host: string; db_name: string }>('database');

            if (!mongooseConfig) {
              throw new InternalServerErrorException('Mongodb config missing');
            }
            return {
              uri: mongooseConfig.host,
              dbName: mongooseConfig.db_name,
            };
          },
          inject: [ConfigService],
        }),
      ],
    };
  }
}
