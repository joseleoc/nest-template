import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  toObject: {
    versionKey: false,
  },
  toJSON: {
    versionKey: false,
  },
  timestamps: true,
})
export class Payment {
  @Prop({ required: true, type: String, trim: true })
  userId: string;

  @Prop({ required: true, type: String, unique: true })
  subscriptionId: string;

  @Prop({ required: true, type: String })
  customerId: string;

  @Prop({ required: true, type: Number })
  // ** Amount in cents */
  amount: number;

  @Prop({ required: true, type: String })
  planId: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);

PaymentSchema.index({ userId: 1 }, { unique: false });
