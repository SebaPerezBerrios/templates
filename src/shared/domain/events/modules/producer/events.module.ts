import { Module } from '@nestjs/common';
import { KafkaModule } from '../../../../infrastructure/kafka';
import { eventTopics } from '../../constants/topics';
import { EventsController } from './events.controller';

@Module({
  imports: [KafkaModule.forPublisherFeature([{ topic: eventTopics.test_topic_1 }])],
  controllers: [EventsController],
})
export class ProducerModule {}
