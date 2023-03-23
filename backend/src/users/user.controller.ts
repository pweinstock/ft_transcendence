import { Controller, Get, Post, Body, UseGuards} from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import { UserService } from './user.service';
import {ChangeDataDTO} from "./dto/change-data.dto";
import {FriendDto} from "./dto/friend.dto";
import { AuthGuard } from '@nestjs/passport';
import TwoFactorAuthenticationGuard from 'src/auth/twoFactorAuthentication.guard';


@Controller('users')
export class UserController {

    constructor(private usersService: UserService) {}

    @Get()
	@UseGuards(AuthGuard('2FA'))
    getAll() {
        return this.usersService.findAll();
    }

    @Post()
    create(@Body() userDto: UserDTO) {
        return this.usersService.createUser(userDto);
    } //todo delete later: Testing purpose only

    @Post('changeName')
    changeName(@Body() changeDataDTO : ChangeDataDTO) {
        this.usersService.changeName(changeDataDTO);
    }

    @Post('changePhoto')
    changePhoto(@Body() changeDataDTO : ChangeDataDTO) {
        this.usersService.changePhoto(changeDataDTO);
    }

    @Post('changeStatus')
    changeStatus(@Body() changeDataDTO : ChangeDataDTO) {
        this.usersService.changePhoto(changeDataDTO);
    }

    @Post('acceptFriendRequest')
    acceptFriendRequest(@Body() dto : FriendDto) {
        this.usersService.acceptFriendRequest(dto);
    }

    @Post('declineFriendRequest')
    async declineFriendRequest(@Body() dto : FriendDto) {
        const user = await this.usersService.findById(dto.userId);
        const friend = await this.usersService.findById(dto.friendId);
        return this.usersService.declineFriendRequest(user, friend);
    }

    @Post('sendFriendRequest')
    async sendFriendRequest(@Body() dto : FriendDto) {
        const user = await this.usersService.findById(dto.userId);
        const friend = await this.usersService.findById(dto.friendId);
        return this.usersService.sendFriendRequest(user, friend);
    }

    @Post('unbanUser')
    async unbanUser(@Body() dto : FriendDto) {
        const user = await this.usersService.findById(dto.userId);
        const friend = await this.usersService.findById(dto.friendId);
        return this.usersService.unbanUser(user, friend);
    }
}
