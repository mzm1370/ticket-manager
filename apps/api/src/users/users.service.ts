import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepo: Repository<User>,
  ) {}

  async register(dto: RegisterDto): Promise<User> {
    const existing = await this.usersRepo.findOneBy({ email: dto.email });
    if (existing) {
      throw new ConflictException('Email already registered');
    }
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepo.create({
      email: dto.email,
      passwordHash,
      role: dto.role,
    });
    return this.usersRepo.save(user);
  }

  findByEmail(email: string) {
    return this.usersRepo.findOneBy({ email });
  }
}
