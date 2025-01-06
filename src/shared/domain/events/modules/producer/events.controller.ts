import { Controller, Post } from '@nestjs/common';
import { eventTopics } from '../../constants/topics';
import { InjectKafkaProducer, KafkaProducer } from '../../../../infrastructure/kafka';

@Controller('events')
export class EventsController {
  constructor(@InjectKafkaProducer(eventTopics.test_topic_1) private readonly producer: KafkaProducer) {}

  @Post()
  async test() {
    await this.producer.send([{ value: { event: 'test', message: 'ok' }, key: '1' }]);
  }
}
