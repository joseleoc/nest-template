import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  PaymentSheetDto,
  PaymentSheetDtoSchema,
} from './dto/payment-sheet.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payment-sheet')
  @UsePipes(new ZodValidationPipe(PaymentSheetDtoSchema))
  @ApiResponse({
    status: 200,
    description: 'When the payment sheet is retrieved successfully',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error, could be caused by a database error.',
  })
  getPaymentSheet(@Body() body: PaymentSheetDto, @Res() res) {
    this.paymentsService
      .getPaymentSheet(body)
      .then((paymentSheet) => {
        res.status(200).json(paymentSheet);
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  }
}
