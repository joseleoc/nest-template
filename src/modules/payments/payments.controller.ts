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
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ZodValidationPipe } from 'nestjs-zod';
import { Response } from 'express';
import Stripe from 'stripe';
import {
  CreateSubscriptionDto,
  CreateSubscriptionDtoSchema,
} from './dto/create-subscription.dto';

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
  // @Post('create-costumer')
  // @UsePipes(new ZodValidationPipe(CreateCustomerDtoSchema))
  // @ApiOperation({
  //   summary: 'Creates a customer for a given user',
  //   description: `Creates a stripe customer and stores the id in the db in the user's customerIds array`,
  // })
  // @ApiNotFoundResponse({ description: 'If the user is not found' })
  // @ApiInternalServerErrorResponse({
  //   description: 'Could be caused by a database error or an stripe error',
  // })
  // @ApiCreatedResponse({
  //   description: 'The customer was successfully created',
  // })
  // @ApiUnauthorizedResponse({ description: 'Auth error - Unauthorized' })
  // @ApiBadRequestResponse({
  //   description:
  //     'Bad request - Validation failed, view the error message for more information',
  // })
  // createCustomer(@Body() body: CreateCustomerDto, @Res() res: Response) {
  //   this.paymentsService
  //     .createCustomer(body)
  //     .then((clientId) => {
  //       res.status(HttpStatus.CREATED).json({ clientId });
  //     })
  //     .catch((error) => {
  //       if (error && error.code) {
  //         res.status(error.code).json(error);
  //         return;
  //       }
  //       res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
  //     });
  // }

  // @Post('create-subscription')
  // @UsePipes(new ZodValidationPipe(CreateSubscriptionDtoSchema))
  // createSubscriptionSession(
  //   @Body() body: CreateSubscriptionDto,
  // ): Promise<Stripe.Response<Stripe.Checkout.Session> | undefined> {
  //   return this.paymentsService.createSubscriptionSession(body);
  // }

  @Post('portal-session')
  updatePlan(
    @Body() body: { user: { customerId: string } },
  ): Promise<Stripe.Response<Stripe.BillingPortal.Session>> {
    return this.paymentsService.getPortal(body.user.customerId);
  }

  @Post('create-subscription')
  @UsePipes(new ZodValidationPipe(CreateSubscriptionDtoSchema))
  @ApiOperation({
    summary: 'Creates a subscription for a given user',
    description: `Creates a stripe subscription and stores the id in the db in the user's subscriptions array`,
  })
  @ApiNotFoundResponse({ description: 'If the user is not found' })
  @ApiInternalServerErrorResponse({
    description: 'Could be caused by a database error or an stripe error',
  })
  @ApiCreatedResponse({
    description: 'The subscription was successfully created',
  })
  @ApiUnauthorizedResponse({ description: 'Auth error - Unauthorized' })
  @ApiBadRequestResponse({
    description:
      'Bad request - Validation failed, view the error message for more information',
  })
  createSubscriptionSession(
    @Body() body: CreateSubscriptionDto,
    @Res() res: Response,
  ) {
    this.paymentsService
      .createSubscriptionSession(body)
      .then((subscription) => {
        if (subscription == null) {
          res
            .status(HttpStatus.BAD_REQUEST)
            .json({ message: 'Subscription not found' });
          return;
        }
        res.status(HttpStatus.CREATED).json(subscription);
      })
      .catch((error) => {
        if (error && error.code) {
          res.status(error.code).json(error);
          return;
        }
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error });
      });
  }
}
