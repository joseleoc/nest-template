import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { UsersModule } from '../users';

@Module({
  controllers: [PaymentsController],
  providers: [PaymentsService],
  imports: [UsersModule],
})
export class PaymentsModule {}
