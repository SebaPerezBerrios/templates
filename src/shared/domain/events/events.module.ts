import { Module } from '@nestjs/common';
import { ConsumerModule } from './modules/consumer/consumer.module';
import { ProducerModule } from './modules/producer/events.module';

@Module({
  imports: [ProducerModule, ConsumerModule],
})
export class EventsModule {}
