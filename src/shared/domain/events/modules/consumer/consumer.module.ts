import { InternalServerErrorException, Module } from '@nestjs/common';
import { KafkaModule } from '../../../../infrastructure/kafka';
import { EventsService } from './events.service';
import { ConfigService } from '@nestjs/config';
import { eventTopics } from '../../constants/topics';

@Module({
  imports: [
    KafkaModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        const brokers = configService.get<string>('brokers');
        if (!brokers) {
          throw new InternalServerErrorException('Kafka config missing');
        }
        return { brokers: JSON.parse(brokers) as string[] };
      },
      inject: [ConfigService],
    }),
    KafkaModule.forConsumerFeature([{ topic: eventTopics.test_topic_1, groupId: 'consumer_1' }]),
  ],
  providers: [EventsService],
})
export class ConsumerModule {}
