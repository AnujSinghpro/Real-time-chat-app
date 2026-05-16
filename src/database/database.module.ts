import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({})
export class DatabaseModule {
  static register(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => {
            const host = configService.get('DATABASE_HOST') || 'localhost';
            const port = configService.get('DATABASE_PORT') || '27017';
            const name = configService.get('DATABASE_NAME') || 'nestjs-modular';
            const username = configService.get('DATABASE_USERNAME');
            const password = configService.get('DATABASE_PASSWORD');
            const authSource = configService.get('DATABASE_AUTH_SOURCE');
            
            let uri;
            if (username && password) {
              const encodedUsername = encodeURIComponent(username);
              const encodedPassword = encodeURIComponent(password);
              uri = `mongodb://${encodedUsername}:${encodedPassword}@${host}:${port}/${name}`;
              
              if (authSource) {
                uri += `?authSource=${authSource}`;
              }
            } else {
              uri = `mongodb://${host}:${port}/${name}`;
            }
            
            return {
              uri,
              serverSelectionTimeoutMS: 5000,
              connectTimeoutMS: 10000,
            };
          },
          inject: [ConfigService],
        }),
      ],
      providers: [],
      exports: [],
    };
  }
}
