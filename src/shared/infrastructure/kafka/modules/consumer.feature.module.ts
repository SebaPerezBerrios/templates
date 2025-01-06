import { Global, Inject, InternalServerErrorException, Logger, Module, OnModuleInit } from '@nestjs/common';
import { last, map } from 'lodash';
import { KAFKA_CONNECTION_MAP, KafkaConnectionMap } from '../constants';
import { KAFKA_CONSUMER_METHOD } from './decorators/consumer';
import { DiscoveredMethodWithMeta, DiscoveryModule, DiscoveryService } from '@golevelup/nestjs-discovery';

@Global()
@Module({ imports: [DiscoveryModule] })
export class KafkaConsumerModule implements OnModuleInit {
  constructor(
    private readonly discover: DiscoveryService,
    @Inject(KAFKA_CONNECTION_MAP) private readonly kafkaConnectionMap: KafkaConnectionMap
  ) {}

  public async onModuleInit() {
    const consumers: DiscoveredMethodWithMeta<{
      name: string;
      connection?: string;
      batch: boolean;
    }>[] = await this.discover.providerMethodsWithMetaAtKey(KAFKA_CONSUMER_METHOD);

    for (const consumer of consumers) {
      const {
        meta: { name, batch, connection },
        discoveredMethod,
      } = consumer;

      const kafkaConnection = connection || 'DEFAULT';
      const kafka = this.kafkaConnectionMap.get(kafkaConnection);

      if (!kafka) {
        throw new InternalServerErrorException(
          `Attempting to use Kafka connection ${kafkaConnection} but not found on DI tree`
        );
      }

      const { instance, topics } = kafka;

      const selectedTopic = topics.get(name);

      if (!selectedTopic) {
        throw new InternalServerErrorException(
          `Attempting to use topic ${name} but not found on connection ${kafkaConnection}`
        );
      }

      const kafkaConsumer = instance.consumer({ groupId: selectedTopic.groupId });
      await kafkaConsumer.subscribe({ topic: selectedTopic.topic, fromBeginning: true });
      if (batch) {
        kafkaConsumer.run({
          eachBatchAutoResolve: true,
          eachBatch: async ({ batch, resolveOffset, heartbeat }) => {
            await discoveredMethod.handler.apply(discoveredMethod.parentClass.instance, [
              map(batch.messages, ({ value, key }) => ({
                value: JSON.parse(value?.toString() || ''),
                key: key?.toString(),
              })),
              heartbeat,
            ]);
            const lastMessage = last(batch.messages);
            if (lastMessage) {
              resolveOffset(lastMessage.offset);
            }
            await heartbeat();
          },
        });
      } else {
        kafkaConsumer.run({
          eachBatchAutoResolve: true,
          eachMessage: async ({ message, heartbeat }) => {
            await discoveredMethod.handler.apply(discoveredMethod.parentClass.instance, [
              { value: JSON.parse(message.value?.toString() || ''), key: message.key?.toString() },
              heartbeat,
            ]);
            await heartbeat();
          },
        });
      }
    }
    Logger.log('All Kafka subscribers listening', 'KafkaConsumerModule');
  }
}
