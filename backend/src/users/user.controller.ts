import { Controller, Get, Post, Body, UseGuards, Req, UseInterceptors, UploadedFile, Param, Res} from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import { UserService } from './user.service';
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

    @Get('/image/:imagename')
    @UseGuards(AuthGuard('2FA'))
    getImage(@Param('imagename') imagename, @Res() res): Promise<Observable<Object>> {
        return this.usersService.getImage(res, imagename);
    }

    //FriendList Interraction
    @Get('/acceptFriend/:id')
    @UseGuards(AuthGuard('2FA'))
    acceptFriendRequest(@Req() request: any, @Param('id') friendId) {
        this.usersService.acceptFriendRequest(request.user, friendId);
    }

    @Get('/declineFriend/:id')
    @UseGuards(AuthGuard('2FA'))
    async declineFriendRequest(@Req() request: any, @Param('id') friendId) {
        const friend = await this.usersService.findById(friendId);
        return this.usersService.declineFriendRequest(request.user, friend);
    }

    @Get('/addFriend/:id')
    @UseGuards(AuthGuard('2FA'))
    async sendFriendRequest(@Req() request: any, @Param('id') friendId) {
        const friend = await this.usersService.findById(friendId);
        return this.usersService.sendFriendRequest(request.user, friend);
    }

    @Get('/ban/:id')
    @UseGuards(AuthGuard('2FA'))
    async banUser(@Req() request: any, @Param('id') friendId) {
        const friend = await this.usersService.findById(friendId);
        return this.usersService.banUser(request.user, friend);
    }

    @Get('/unban/:id')
    @UseGuards(AuthGuard('2FA'))
    async unbanUser(@Req() request: any, @Param('id') friendId) {
        const friend = await this.usersService.findById(friendId);
        return this.usersService.unbanUser(request.user, friend);
    }
}
