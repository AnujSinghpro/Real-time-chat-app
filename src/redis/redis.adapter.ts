import { IoAdapter } from '@nestjs/platform-socket.io';
import { INestApplication } from '@nestjs/common';

import { createAdapter } from '@socket.io/redis-adapter';

import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {

  private adapterConstructor: ReturnType<
    typeof createAdapter
  >;

  constructor(
    app: INestApplication,
  ) {
    super(app);
  }

  async connectToRedis(): Promise<void> {

    const pubClient = createClient({
      url: 'redis://localhost:6380',
    });

    const subClient =
      pubClient.duplicate();

    await pubClient.connect();
    await subClient.connect();

    this.adapterConstructor =
      createAdapter(
        pubClient,
        subClient,
      );
  }

  createIOServer(
    port: number,
    options?: any,
  ): any {

    const server =
      super.createIOServer(
        port,
        options,
      );

    server.adapter(
      this.adapterConstructor,
    );

    return server;
  }
}