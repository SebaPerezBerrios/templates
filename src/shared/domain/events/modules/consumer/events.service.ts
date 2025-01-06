import { Injectable, Logger } from '@nestjs/common';
import { HandleMessage, HeartBeat, MessageBody } from '../../../../infrastructure/kafka';
import { eventTopics } from '../../constants/topics';
import { ZodValidate } from '../../../../utils/types';
import { EventDto } from '../../dtos/event.dto';

@Injectable()
export class EventsService {
  @HandleMessage(eventTopics.test_topic_1)
  async handler(
    @MessageBody(ZodValidate(EventDto))
    messageBody: EventDto,
    @HeartBeat() heartbeat: HeartBeat
  ) {
    Logger.log(`Got message ${JSON.stringify(messageBody)}`);
    await heartbeat();
  }
}
