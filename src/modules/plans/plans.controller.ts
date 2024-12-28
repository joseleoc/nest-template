import { Controller, Get, Res } from '@nestjs/common';
import { PlansService } from './plans.service';
import { Response } from 'express';
import { SkipAuth } from '@/decorators/index';

@Controller('plans')
export class PlansController {
  constructor(private readonly plansService: PlansService) {}

  @Get()
  @SkipAuth()
  getPlans(@Res() res: Response) {
    this.plansService
      .findAll()
      .then((plans) => {
        res.status(200).json(plans);
      })
      .catch((error) => {
        if (error?.code != null) {
          res.status(error.code).json(error);
          return;
        }
        res.status(500).json(error);
      });
  }
}
