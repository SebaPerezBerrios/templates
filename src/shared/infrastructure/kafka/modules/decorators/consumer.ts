import { PipeTransform, SetMetadata, Type } from '@nestjs/common';
import { KafkaMessage } from 'kafkajs';
import { every, forEach, map, reduce } from 'lodash';

export const KAFKA_CONSUMER_METHOD = 'KAFKA_CONSUMER_METHOD';
export const KAFKA_BODY_DECORATOR = 'KAFKA_BODY_DECORATOR';
export const KAFKA_HEARTBEAT_DECORATOR = 'KAFKA_HEARTBEAT_DECORATOR';

type metaDataValidator = {
  transformers: PipeTransform[];
  index: number;
  batch: boolean;
};

export const transformBody = (transformers: PipeTransform<unknown, unknown>[], body: unknown) => {
  return reduce(transformers, (acc, transformer) => transformer.transform(acc, { type: 'body' }), body);
};

export const HandleMessage = (name: string): MethodDecorator => {
  return (target, propertyKey, descriptor: PropertyDescriptor): void => {
    const method = descriptor.value;

    const messageBodyParameters: metaDataValidator[] = Reflect.getOwnMetadata(
      KAFKA_BODY_DECORATOR,
      target,
      propertyKey
    );

    const heartbeatParameters: number[] = Reflect.getOwnMetadata(KAFKA_HEARTBEAT_DECORATOR, target, propertyKey);

    // override method with transformers applies to args
    descriptor.value = async function (message: [KafkaMessage | KafkaMessage[]], heartbeat: () => Promise<void>) {
      const newArgs: unknown[] = [];

      if (messageBodyParameters) {
        await Promise.all(
          map(messageBodyParameters, async ({ index, transformers }) => {
            try {
              newArgs[index] = await transformBody(transformers, message);
            } catch (err: any) {
              throw new Error(err?.response?.message || err?.message || err);
            }
          })
        );
      }

      forEach(heartbeatParameters, (index) => {
        newArgs[index] = heartbeat;
      });

      return await method?.apply(this, newArgs);
    };

    // anotate for message queue subscriber dependency injection
    SetMetadata(KAFKA_CONSUMER_METHOD, {
      name,
      batch: every(messageBodyParameters, ({ batch }) => batch),
    })(target, propertyKey, descriptor);
  };
};

function isPipeTransformFunction(pipe: PipeTransform | Type<PipeTransform>): pipe is PipeTransform {
  return (<PipeTransform>pipe).transform !== undefined;
}

const makeMessageBody =
  (batch: boolean) =>
  (...pipes: (Type<PipeTransform> | PipeTransform)[]): ParameterDecorator =>
  (target, propertyKey, parameterIndex) => {
    const existingParameters: metaDataValidator[] =
      Reflect.getOwnMetadata(KAFKA_BODY_DECORATOR, target, propertyKey as string | symbol) || [];

    const transformers = map(pipes, (pipe) => (isPipeTransformFunction(pipe) ? pipe : new pipe()));

    existingParameters.push({
      transformers,
      index: parameterIndex,
      batch,
    });

    Reflect.defineMetadata(KAFKA_BODY_DECORATOR, existingParameters, target, propertyKey as string | symbol);
  };

export const HeartBeat = (): ParameterDecorator => (target, propertyKey, parameterIndex) => {
  const existingParameters: number[] =
    Reflect.getOwnMetadata(KAFKA_HEARTBEAT_DECORATOR, target, propertyKey as string | symbol) || [];
  existingParameters.push(parameterIndex);

  Reflect.defineMetadata(KAFKA_HEARTBEAT_DECORATOR, existingParameters, target, propertyKey as string | symbol);
};
export type HeartBeat = () => Promise<void>;

export const MessageBody = makeMessageBody(false);
export const MessageBodyBatch = makeMessageBody(true);
