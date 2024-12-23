import {
  Body,
  Controller,
  HttpStatus,
  Post,
  Res,
  UsePipes,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
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
import {
  CreateCustomerDto,
  CreateCustomerDtoSchema,
} from './dto/create-customer.dto';
import { Response } from 'express';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
  // --------------------------------------------------------------------------------
  // Constructor
  // --------------------------------------------------------------------------------
  constructor(private readonly paymentsService: PaymentsService) {}

  // --------------------------------------------------------------------------------
  // Public methods
  // --------------------------------------------------------------------------------
  @Post('create-costumer')
  @UsePipes(new ZodValidationPipe(CreateCustomerDtoSchema))
  @ApiOperation({
    summary: 'Creates a customer for a given user',
    description: `Creates a stripe customer and stores the id in the db in the user's customerIds array`,
  })
  @ApiNotFoundResponse({ description: 'If the user is not found' })
  @ApiInternalServerErrorResponse({
    description: 'Could be caused by a database error or an stripe error',
  })
  @ApiCreatedResponse({
    description: 'The customer was successfully created',
  })
  @ApiUnauthorizedResponse({ description: 'Auth error - Unauthorized' })
  @ApiBadRequestResponse({
    description:
      'Bad request - Validation failed, view the error message for more information',
  })
  createCustomer(@Body() body: CreateCustomerDto, @Res() res: Response) {
    this.paymentsService
      .createCostumer(body)
      .then((clientId) => {
        res.status(HttpStatus.CREATED).json({ clientId });
      })
      .catch((error) => {
        if (error && error.code) {
          res.status(error.code).json(error);
          return;
        }
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
      });
  }

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
