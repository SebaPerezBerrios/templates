import { DynamicModule, Injectable, Module } from '@nestjs/common';
import { Observable, Subject, share } from 'rxjs';

@Injectable()
export class Channel<T> {
  public subject!: Subject<T>;
  public observable!: Observable<T>;
}

@Module({})
export class ChannelModule {
  static register(): DynamicModule {
    const providers = [
      {
        provide: Channel,
        useFactory: () => {
          const subject = new Subject<unknown>();
          const observable = subject.pipe(share());
          return { subject, observable };
        },
      },
    ];
    return {
      module: ChannelModule,
      providers,
      exports: providers,
    };
  }
}
