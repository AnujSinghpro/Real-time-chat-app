import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {

  public pubClient: Redis;
  public subClient: Redis;

  constructor() {

    this.pubClient = new Redis({
      host: '127.0.0.1',
      port: 6380,
    });

    this.subClient =
      this.pubClient.duplicate();
  }
}