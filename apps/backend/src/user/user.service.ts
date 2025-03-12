import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { validate } from 'class-validator';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { EntityManager, wrap } from '@mikro-orm/core';
import { SECRET } from '../config';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './user.entity';
import { IUserRO } from './user.interface';
import { UserRepository } from './user.repository';
import { ConduitRosterEntry } from './user.types'; 

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository, private readonly em: EntityManager) {}

  async findAll(): Promise<User[]> {
    return this.userRepository.findAll();
  }

  async findOne(loginUserDto: LoginUserDto): Promise<User | null> {
    const findOneOptions = {
      email: loginUserDto.email,
      password: crypto.createHmac('sha256', loginUserDto.password).digest('hex'),
    };

    return this.userRepository.findOne(findOneOptions) ?? null;
  }

  async create(dto: CreateUserDto): Promise<IUserRO> {
    const { username, email, password } = dto;
    const exists = await this.userRepository.count({ $or: [{ username }, { email }] });

    if (exists > 0) {
      throw new HttpException(
        {
          message: 'Input data validation failed',
          errors: { username: 'Username and email must be unique.' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const user = new User(username, email, password);
    const errors = await validate(user);

    if (errors.length > 0) {
      throw new HttpException(
        {
          message: 'Input data validation failed',
          errors: { username: 'User input is not valid.' },
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    await this.em.persistAndFlush(user);
    return this.buildUserRO(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<IUserRO> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new HttpException({ message: 'User not found' }, HttpStatus.NOT_FOUND);
    }

    wrap(user).assign(dto);
    await this.em.flush();

    return this.buildUserRO(user);
  }

  async delete(email: string): Promise<number> {
    return this.userRepository.nativeDelete({ email });
  }

  async findById(id: number): Promise<IUserRO> {
    const user = await this.userRepository.findOne(id);

    if (!user) {
      throw new HttpException({ message: 'User not found' }, HttpStatus.NOT_FOUND);
    }

    return this.buildUserRO(user);
  }

  async findByEmail(email: string): Promise<IUserRO> {
    const user = await this.userRepository.findOne({ email });

    if (!user) {
      throw new HttpException({ message: 'User not found' }, HttpStatus.NOT_FOUND);
    }

    return this.buildUserRO(user);
  }

  generateJWT(user: User): string {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);

    return jwt.sign(
      {
        email: user.email,
        exp: Math.floor(exp.getTime() / 1000),
        id: user.id,
        username: user.username,
      },
      SECRET,
    );
  }

  private buildUserRO(user: User): IUserRO {
    return {
      user: {
        bio: user.bio,
        email: user.email,
        image: user.image,
        token: this.generateJWT(user),
        username: user.username,
      },
    };
  }
  async getConduitRoster(): Promise<ConduitRosterEntry[]> {
    return this.userRepository.getConduitRoster();
  }
}



