import { Injectable, BadRequestException, NotFoundException ,UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, role } = registerDto;
    
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('البريد الإلكتروني مستخدم بالفعل');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      role: role || 'CASHIER',
    });

    await this.userRepository.save(user);
    return { success: true, message: 'تم إنشاء المستخدم بنجاح' };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refreshToken);

    return tokens;
  }

 async refreshTokens(refreshToken: string) {
    try {
      // 1. التحقق من صحة الـ Refresh Token والسر الخاص به
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      // 2. البحث عن المستخدم التأكد من وجوده
      const user = await this.userRepository.findOne({ where: { id: payload.sub } });
      if (!user || user.refreshToken !== refreshToken) {
        throw new ForbiddenException('Access Denied');
      }
    // 3. توليد ثنائي توكن جديد (Access & Refresh) لرفع مستوى الأمان
      const tokens = await this.generateTokens(user.id.toString(), user.email, user.role);
    // 4. تحديث وحفظ الـ Refresh Token الجديد في قاعدة البيانات
       await this.userRepository.update(user.id, { refreshToken: tokens.refreshToken });
      return  tokens;
    } catch (err) {
      throw new ForbiddenException('Invalid or Expired Refresh Token');
    }
  }


  async changePassword(userId: string, changePasswordDto: ChangePasswordDto) {
  // 1. البحث عن المستخدم في قاعدة البيانات
  const user = await this.userRepository.findOne({ where: { id: userId } });
  if (!user) {
    throw new NotFoundException('المستخدم غير موجود');
  }

  // 2. التحقق من صحة كلمة المرور القديمة
  const isPasswordValid = await bcrypt.compare(
    changePasswordDto.oldPassword,
    user.password,
  );
  if (!isPasswordValid) {
    throw new UnauthorizedException('كلمة المرور القديمة غير صحيحة');
  }

  // 3. تشفير كلمة المرور الجديدة وتحديثها
  user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
  await this.userRepository.save(user);

  return {
    success: true,
    message: 'تم تغيير كلمة المرور بنجاح',
  };
}


  async logout(userId: string) {
    await this.userRepository.update(userId, { refreshToken: null as any });
    return { success: true, message: 'تم تسجيل الخروج بنجاح' };
  }

  private async generateTokens(userId: string, email: string, role: string) {
    const payload = { sub: userId, email, role };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private async updateRefreshToken(userId: string, refreshToken: string) {
    await this.userRepository.update(userId, { refreshToken });
  }
}