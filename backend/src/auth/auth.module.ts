import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/users/users.model';
import { UsersModule } from 'src/users/users.module';
import { AuthController } from './auth.controller';
import { FortyTwoStrategy } from './FortyTwoStrategy';

@Module({
  controllers: [ AuthController ],
  providers: [ FortyTwoStrategy ],
  imports: [ UsersModule ] 
})
export class AuthModule {}
