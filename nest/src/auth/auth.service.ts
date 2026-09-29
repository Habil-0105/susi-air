import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login(loginDto: LoginDto) {
    if (loginDto.username !== 'johndoe' || loginDto.password !== 'susiairtest') {
      throw new UnauthorizedException('Invalid username or password');
    }

    const payload = { sub: loginDto.username, username: loginDto.username };
    const expiresIn = '1d';
    
    return {
      accessToken: await this.jwtService.signAsync(payload),
      tokenType: 'Bearer',
      expiresIn,
    };
  }
}
