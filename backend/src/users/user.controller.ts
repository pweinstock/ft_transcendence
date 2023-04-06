import { Controller, Get, Post, Body, UseGuards, Req, UseInterceptors, UploadedFile, Param, Res} from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import { UserService } from './user.service';
import {FriendDto} from "./dto/friend.dto";
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { Observable } from 'rxjs';
import { Request } from 'express';

export const storage = {
    storage: diskStorage({
        destination: './uploads/image',
        filename: (req, file, cb) => {
            const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
            const extension: string = path.parse(file.originalname).ext;

            cb(null, `${filename}${extension}`)
        }
    })

}


@Controller('users')
export class UserController {

    constructor(private usersService: UserService) {}

    @Get()
	@UseGuards(AuthGuard('2FA'))
    getAll() {
        return this.usersService.findAll();
    }

    @Get('current')
    @UseGuards(AuthGuard('2FA'))
    getUser(@Req() request: Request) {
        return request.user;
    }

    @Get(':id')
    @UseGuards(AuthGuard('2FA'))
    getPublicUser(@Param('id') id) {
        return this.usersService.findById(id);;
    }

    @Post()
    create(@Body() userDto: UserDTO) {
        return this.usersService.createUser(userDto);
    } //todo delete later: Testing purpose only


    @Post('changeName')
    @UseGuards(AuthGuard('2FA'))
    async changeName(@Req() request: any, @Body('newName') newName: string) {
       await this.usersService.changeName(request.user.id, newName);
    }

    @Post('upload')
    @UseGuards(AuthGuard('2FA'))
    @UseInterceptors(FileInterceptor('file', storage))
    uploadFile(@UploadedFile() file, @Req() req): Promise<string> {
        console.log('req.user.photo: %s', req.user.photo);
        if (req.user.photo != 'null')
            this.usersService.deleteImage(req.user.photo); 
        return this.usersService.uploadAvatar(req.user.id, file.filename)
    }

    @Post('delete')
    @UseGuards(AuthGuard('2FA'))
    deleteAvatar(@Req() req) {
        this.usersService.deleteImage(req.user.photo);
        this.usersService.uploadAvatar(req.user.id, null)
    }

    @Get('image/:imagename')
    @UseGuards(AuthGuard('2FA'))
    getImage(@Param('imagename') imagename, @Res() res): Promise<Observable<Object>> {
        return this.usersService.getImage(res, imagename);
    }


    // @Post('changeStatus')
    // changeStatus(@Body() changeDataDTO : ChangeDataDTO) {
    //     this.usersService.changePhoto(changeDataDTO);
    // }

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
