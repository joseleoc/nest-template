import { SetMetadata } from '@nestjs/common';

export const CAN_SKIP_AUTH_KEY = 'canSkipAuth';
export const SkipAuth = () => SetMetadata(CAN_SKIP_AUTH_KEY, true);
