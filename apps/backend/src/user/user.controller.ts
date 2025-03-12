import { 
  Body, Controller, Delete, Get, HttpException, Param, Post, Put, UsePipes 
} from '@nestjs/common';
import { ValidationPipe } from '../shared/pipes/validation.pipe';
import { CreateUserDto, LoginUserDto, UpdateUserDto } from './dto';
import { User } from './user.decorator';
import { IUserRO } from './user.interface';
import { UserService } from './user.service';
import { ConduitRosterEntry } from './user.types';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiBearerAuth()
@ApiTags('user')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('user')
  async findMe(@User('email') email: string): Promise<IUserRO> {
    return this.userService.findByEmail(email);
  }

  @Put('user')
  async update(@User('id') userId: number, @Body('user') userData: UpdateUserDto): Promise<IUserRO> {
    return this.userService.update(userId, userData);
  }

  @UsePipes(new ValidationPipe())
  @Post('users')
  async create(@Body('user') userData: CreateUserDto): Promise<IUserRO> {
    return this.userService.create(userData);
  }

  @Delete('users/:slug')
  async delete(@Param('slug') slug: string): Promise<{ message: string }> {
    await this.userService.delete(slug);
    return { message: 'User deleted successfully' };
  }

  @UsePipes(new ValidationPipe())
  @Post('users/login')
  async login(@Body('user') loginUserDto: LoginUserDto): Promise<IUserRO> {
    const foundUser = await this.userService.findOne(loginUserDto);

    if (!foundUser) {
      throw new HttpException({ errors: { User: 'not found' } }, 401);
    }

    const token = this.userService.generateJWT(foundUser);
    const { email, username, bio, image } = foundUser;
    
    return {
      user: { email, token, username, bio, image },
    };
  }

  @Get('users/roster')
  async getConduitRoster(): Promise<ConduitRosterEntry[]> {
    return this.userService.getConduitRoster();
  }
}



