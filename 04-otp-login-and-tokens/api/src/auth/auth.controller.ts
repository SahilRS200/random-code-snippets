import { Body, Controller, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from '../users/users.service';
import { OtpService } from './otp.service';
import { TokenPair, TokensService } from './tokens.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly otp: OtpService,
    private readonly tokens: TokensService,
    private readonly users: UsersService,
  ) {}

  @Post('otp')
  @HttpCode(202)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async sendOtp(@Body('mobile') mobile: string): Promise<{ sent: true }> {
    await this.otp.send(mobile);
    return { sent: true };
  }

  @Post('verify')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verify(@Body() body: { mobile: string; otp: string }): Promise<TokenPair> {
    const ok = await this.otp.verify(body.mobile, body.otp);
    if (!ok) {
      throw new UnauthorizedException('Wrong or expired code');
    }
    const user = await this.users.findOrCreateByMobile(body.mobile);
    return this.tokens.issue({ id: user.id, role: user.role });
  }

  @Post('refresh')
  refresh(@Body('refreshToken') refreshToken: string): TokenPair {
    return this.tokens.refresh(refreshToken);
  }

  // The app deletes both tokens on its side
  @Post('logout')
  @HttpCode(204)
  logout(): void {
    return;
  }
}
