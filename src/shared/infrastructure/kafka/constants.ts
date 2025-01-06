import { Consumer, Kafka, Producer } from 'kafkajs';

export const KAFKA_PRODUCER_MAP = 'KAFKA_PRODUCER_MAP';

export type KafkaProducerMap = Map<string, Producer>;

export const KAFKA_CONSUMER_MAP = 'KAFKA_CONSUMER_MAP';

export type KafkaConsumerMap = Map<string, Consumer>;

export const KAFKA_CONNECTION_MAP = 'KAFKA_CONNECTION_MAP ';

export type KafkaConnectionMap = Map<string, { instance: Kafka; topics: Map<string, ConsumerTopicConfig> }>;

export type TopicConfig = {
  topic: string;
  connection?: string;
};

export type ConsumerTopicConfig = {
  topic: string;
  groupId: string;
  connection?: string;
};
