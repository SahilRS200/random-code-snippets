import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { SmsService } from '../sms/sms.service';

const OTP_TTL_SECONDS = 10 * 60;

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly redis: Redis,
    private readonly sms: SmsService,
  ) {}

  async send(mobile: string): Promise<void> {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    await this.redis.set(`otp:${mobile}`, otp, 'EX', OTP_TTL_SECONDS);
    await this.sms.send(mobile, `Your login code is ${otp}. It expires in 10 minutes.`);
    this.logger.log(`OTP sent to ${mobile}: ${otp}`);
  }

  async verify(mobile: string, otp: string): Promise<boolean> {
    const stored = await this.redis.get(`otp:${mobile}`);

    if (!stored || stored !== otp) {
      const tries = await this.redis.incr(`otp-tries:${mobile}`);
      if (tries === 1) {
        await this.redis.expire(`otp-tries:${mobile}`, OTP_TTL_SECONDS);
      }
      this.logger.warn(`Wrong OTP for ${mobile} (try ${tries})`);
      return false;
    }

    await this.redis.del(`otp:${mobile}`, `otp-tries:${mobile}`);
    return true;
  }
}
