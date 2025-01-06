import { DynamicModule, Global, Inject, InternalServerErrorException } from '@nestjs/common';
import { map } from 'lodash';
import { KAFKA_CONNECTION_MAP, KafkaConnectionMap, TopicConfig } from '../constants';

export const InjectKafkaProducer = (name: string) => Inject(getKafkaToken(name));
export type KafkaProducer = { send: (messages: { key?: string; value: object }[]) => Promise<void> };

const getKafkaToken = (token: string) => `KAFKA-PUBLISHER-${token}`;

@Global()
export class KafkaProducerFeatureModule {
  static register(topics: TopicConfig[]): DynamicModule {
    const providers = this.setKafkaProviders(topics);
    return {
      module: KafkaProducerFeatureModule,
      providers,
      exports: providers,
    };
  }

  private static setKafkaProviders(topics: TopicConfig[]) {
    return map(topics, (topic) => KafkaProducerFeatureModule.makeProvider(topic));
  }

  private static makeProvider(topicConfig: TopicConfig) {
    return {
      provide: getKafkaToken(topicConfig.topic),
      useFactory: (kafkaConnectionMap: KafkaConnectionMap) => {
        const kafkaConnection = topicConfig.connection || 'DEFAULT';
        const kafka = kafkaConnectionMap.get(kafkaConnection);
        if (!kafka) {
          throw new InternalServerErrorException(
            `Attempting to use Kafka connection ${kafkaConnection} but not found on DI tree`
          );
        }
        const newProducer = kafka.instance.producer();
        newProducer.connect();
        return {
          send: (messages: { key?: string; value: object }[]) =>
            newProducer.send({
              topic: topicConfig.topic,
              messages: map(messages, ({ key, value }) => ({ key, value: Buffer.from(JSON.stringify(value)) })),
            }),
        };
      },
      inject: [KAFKA_CONNECTION_MAP],
    };
  }
}
