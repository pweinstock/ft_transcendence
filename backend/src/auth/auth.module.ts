import { Module } from '@nestjs/common';
import { UsersModule } from 'src/users/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FortyTwoStrategy } from './FortyTwoStrategy';

@Module({
  controllers: [ AuthController ],
  providers: [ AuthService, FortyTwoStrategy ],
  imports: [ UsersModule ] 
})
export class AuthModule {}

