import { Body, Controller, Post, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payment-sheet')
  getPaymentSheet(@Body() body: any, @Res() res) {
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
