import { DynamicModule, Global, InternalServerErrorException, Provider } from '@nestjs/common';
import { ConsumerTopicConfig, KAFKA_CONNECTION_MAP, KafkaConnectionMap, TopicConfig } from '../constants';
import { Kafka, KafkaConfig } from 'kafkajs';
import { KafkaProducerFeatureModule } from './producer.feature.module';
import { map } from 'lodash';
import { KafkaConsumerModule } from './consumer.feature.module';

export type KafkaCoreModuleConfig = KafkaConfig & { connection?: string };
const getKafkaToken = (token: string) => `KAFKA-SUBSCRIBER-${token}`;

@Global()
export class KafkaModule {
  static register(config: KafkaCoreModuleConfig): DynamicModule {
    const KafkaConnectionMapProvider = this.createKafkaConnectionMapProvider();

    const providerList = [KafkaConnectionMapProvider];
    return {
      imports: [KafkaConsumerModule],
      module: KafkaModule,
      providers: [...providerList, { provide: 'KAFKA_CONFIG', useValue: config }],
      exports: providerList,
    };
  }

  static registerAsync(config: {
    useFactory: (...args: any[]) => Promise<KafkaCoreModuleConfig> | KafkaCoreModuleConfig;
    inject?: any[];
  }): DynamicModule {
    const KafkaConnectionMapProvider = this.createKafkaConnectionMapProvider();
    const providerList = [KafkaConnectionMapProvider];

    return {
      imports: [KafkaConsumerModule],
      module: KafkaModule,
      providers: [...providerList, { provide: 'KAFKA_CONFIG', useFactory: config.useFactory, inject: config.inject }],
      exports: providerList,
    };
  }

  private static createKafkaConnectionMapProvider(): Provider {
    return {
      provide: KAFKA_CONNECTION_MAP,
      useFactory: (config: KafkaCoreModuleConfig): KafkaConnectionMap => {
        return new Map([[config.connection || 'DEFAULT', { instance: new Kafka(config), topics: new Map() }]]);
      },
      inject: ['KAFKA_CONFIG'],
    };
  }

  static forPublisherFeature(topics: TopicConfig[]): DynamicModule {
    return {
      module: KafkaModule,
      imports: [KafkaProducerFeatureModule.register(topics)],
    };
  }

  static forConsumerFeature(topics: ConsumerTopicConfig[]): DynamicModule {
    return {
      module: KafkaModule,
      imports: [],
      providers: KafkaModule.setKafkaProviders(topics),
    };
  }

  private static setKafkaProviders(topics: ConsumerTopicConfig[]) {
    return map(topics, (topic) => KafkaModule.setProvider(topic));
  }

  private static setProvider(topicConfig: ConsumerTopicConfig) {
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
        kafka.topics.set(topicConfig.topic, topicConfig);
        return topicConfig;
      },
      inject: [KAFKA_CONNECTION_MAP],
    };
  }
}
