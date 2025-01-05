import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from '../../../config/config';

@Module({})
export class EnvConfigModule {
  static register(): DynamicModule {
    const imports = [ConfigModule.forRoot({ isGlobal: true, load: [configuration] })];
    return {
      module: EnvConfigModule,
      imports: imports,
      providers: [],
      exports: [],
    };
  }
}
