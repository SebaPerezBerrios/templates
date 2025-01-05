import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './shared/domain/user';
import { EnvConfigModule } from './shared/infrastructure/config/config.module';

@Module({
  imports: [EnvConfigModule.register(), AuthModule.register()],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
