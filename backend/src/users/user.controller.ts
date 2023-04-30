import { Controller, Get, Post, Body, UseGuards, Req, UseInterceptors, UploadedFile, Param, Res, ParseFilePipe, MaxFileSizeValidator, HttpException, HttpStatus, FileTypeValidator} from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path = require('path');
import { Observable } from 'rxjs';
import { Request } from 'express';
import {User} from "./user.entity";
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

const multerOptions: MulterOptions = {
    storage: diskStorage({
                destination: './uploads/image',
                filename: (req, file, cb) => {
                    const filename: string = path.parse(file.originalname).name.replace(/\s/g, '') + uuidv4();
                    const extension: string = path.parse(file.originalname).ext;
        
                    cb(null, `${filename}${extension}`)
                }
            }),
    fileFilter: (request, file, callback) => {
        if (!file.mimetype.includes('image')) {
          return callback(new HttpException('Provide a valid image', HttpStatus.BAD_REQUEST),false);
        }
        callback(null, true);
      },
    limits :{
      fileSize: Math.pow(1024, 2) * 2
    }
}


@Controller('users')
export class UserController {

    constructor(private usersService: UserService) {}

    @Get()
	@UseGuards(AuthGuard('2FA'))
    async getAll() : Promise<User[]>{
        return this.usersService.findAll();
    }

    @Get('current')
    @UseGuards(AuthGuard('2FA'))
    getUser(@Req() request: Request) {
        return request.user;
    }

    @Get('/id/:id')
    @UseGuards(AuthGuard('2FA'))
    async getUserById(@Param('id') UserId : string) : Promise<User> {
        return this.usersService.findById(UserId);
    }
    
    @Get('/name/:name')
    @UseGuards(AuthGuard('2FA'))
    async getPublicUser(@Param('name') displayName : string) : Promise<User> {
        const regex = /^[A-Za-z0-9]+$/;
        if (!regex.test(displayName))
            throw new HttpException("Username is invalid", HttpStatus.NOT_ACCEPTABLE);
        return this.usersService.findByName(displayName);
    }

    @Post('changeName')
    @UseGuards(AuthGuard('2FA'))
    async changeName(@Req() request: any, @Body('newName') newName: string) : Promise<void>{
        await this.usersService.changeName(request.user.id, newName);
    }

    @Post('upload')
    @UseGuards(AuthGuard('2FA'))
    @UseInterceptors(FileInterceptor('file', multerOptions))
    uploadFile(@UploadedFile() file, @Req() req) : Promise<string> {
        if (req.user.photo != 'null')
            this.usersService.deleteImage(req.user.photo); 
        return this.usersService.uploadAvatar(req.user.id, file.filename)
    }

    @Post('delete')
    @UseGuards(AuthGuard('2FA'))
    deleteAvatar(@Req() req) : void {
        this.usersService.deleteImage(req.user.photo);
        this.usersService.uploadAvatar(req.user.id, null)
    }

    @Get('/image/:imagename')
    @UseGuards(AuthGuard('2FA'))
    getImage(@Param('imagename') imagename : string, @Res() res): Promise<Observable<Object>> {
        return this.usersService.getImage(res, imagename);
    }

    //FriendList Interraction
    @Get('/acceptFriend/:id')
    @UseGuards(AuthGuard('2FA'))
    acceptFriendRequest(@Req() request: any, @Param('id') friendId : string) : void {
        this.usersService.acceptFriendRequest(request.user, friendId);
    }

    @Get('/declineFriend/:id')
    @UseGuards(AuthGuard('2FA'))
    async declineFriendRequest(@Req() request: any, @Param('id') friendId : string) : Promise<void> {
        const friend = await this.usersService.findById(friendId);
        this.usersService.declineFriendRequest(request.user, friend);
    }

    @Get('/addFriend/:id')
    @UseGuards(AuthGuard('2FA'))
    async sendFriendRequest(@Req() request: any, @Param('id') friendId : string) : Promise<void> {
        const friend = await this.usersService.findById(friendId);
        this.usersService.sendFriendRequest(request.user, friend);
    }

    @Get('/deleteFriend/:id')
    @UseGuards(AuthGuard('2FA'))
    async deleteFriendRequest(@Req() request: any, @Param('id') friendId : string) : Promise<void> {
        const friend = await this.usersService.findById(friendId);
        this.usersService.deleteFriend(request.user, friend);
    }

    @Get('/ban/:id')
    @UseGuards(AuthGuard('2FA'))
    async banUser(@Req() request: any, @Param('id') friendId : string) : Promise<void> {
        const friend = await this.usersService.findById(friendId);
        this.usersService.banUser(request.user, friend);
    }

    @Get('/unban/:id')
    @UseGuards(AuthGuard('2FA'))
    async unbanUser(@Req() request: any, @Param('id') friendId : string) : Promise<void> {
        const friend = await this.usersService.findById(friendId);
        this.usersService.unbanUser(request.user, friend);
    }
}
