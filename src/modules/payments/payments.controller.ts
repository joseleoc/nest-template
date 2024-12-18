import { Body, Controller, Post, Res, UsePipes } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import {
  PaymentSheetDto,
  PaymentSheetDtoSchema,
} from './dto/payment-sheet.dto';
import {
  PaymentIntentDto,
  PaymentIntentDtoSchema,
} from './dto/payment-intent.dto';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('payment-intent')
  @UsePipes(new ZodValidationPipe(PaymentIntentDtoSchema))
  @ApiOperation({
    summary: 'Create a payment intent',
    description:
      'Creates a payment intent for a user and retrieves the client secret.',
  })
  @ApiCreatedResponse({
    description: 'Creates an payment intent and retrieves the client secret',
  })
  @ApiUnauthorizedResponse({ description: 'Auth error - Unauthorized' })
  @ApiBadRequestResponse({
    description:
      'Bad request - Validation failed, view the error message for more information',
  })
  @ApiInternalServerErrorResponse({
    description: 'Internal server error, could be caused by a stripe error.',
  })
  paymentIntent(@Body() body: PaymentIntentDto, @Res() res) {
    this.paymentsService
      .paymentIntent(body)
      .then((paymentIntent) => {
        res.status(200).json(paymentIntent.client_secret);
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  }

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
