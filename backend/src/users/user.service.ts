import {HttpException, HttpStatus, Injectable, Res} from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import {User, UserStatus} from "./user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {FriendDto} from "./dto/friend.dto";
import { join } from 'path';
import { Observable, of } from 'rxjs';
import {Chat} from "../chat/chat.entity";


@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository : Repository<User>) {
    }

    async createUser(dto: UserDTO): Promise<User> {
        if (!dto.email || !dto.displayName)
            throw new HttpException('Required information was not provided!', HttpStatus.BAD_REQUEST);
        const existingUser = await this.userRepository.findOneBy({email: dto.email});
        if (existingUser) {
            await this.userRepository.update(existingUser.id, {first: false})
            return existingUser;
        }
        const user = this.userRepository.create(dto);
        user.pendingFriends = [];
        user.bannedUsers = [];
        user.friends = [];
        user.chats = [];
        user.matchHistory = [];
        return this.userRepository.save(user);
    }

    //Geting User
    async findAll(): Promise<User[]> {
        const users = await this.userRepository.find();
        return users;
    }

    async findByEmail(userEmail: string): Promise<User> {
        const user = await this.userRepository.findOneBy({email: userEmail});
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        return user;
    }

    async findById(userId: number): Promise<User> {
        const user = await this.userRepository.findOneBy({id: userId});
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        return user;
    }

    async remove(user: User) : Promise<void> {
        await this.userRepository.remove(user);
    }

    //USER INFO
    async changeName(id: number, newName: string) : Promise<void> {
        try {
            await this.userRepository.update(id, { displayName: newName});
        }
        catch (e) {
            throw new HttpException("Name is not unique!", HttpStatus.BAD_REQUEST);
        }
    }

    async uploadAvatar(id: number, filename: string) : Promise<any> {
        return this.userRepository.update(id, {photo: filename});
    }

    deleteImage(imagename: string) {
		let fs = require('fs');
		let filePath = "./uploads/image/" + imagename;
		fs.stat(filePath, function (err, stats) {
			if (err) {
				return console.error(err);
			}
			fs.unlinkSync(filePath);
		})
	}

    async getImage(@Res() res, imagename: string): Promise<Observable<Object>> {
        if (imagename === 'null')
            return of(res.sendFile(join(process.cwd(), './uploads/image/' + 'littleman.png')));
        return of(res.sendFile(join(process.cwd(), './uploads/image/' + imagename)));
    }

    async changeStatus(user : User, status : UserStatus) : Promise<User> {
        user.status = status;
        return this.userRepository.save(user);
    }

    //FRIEND LIST
    async acceptFriendRequest(dto : FriendDto) : Promise<void> {
        const friend = await this.findById(dto.friendId);
        const user = await this.findById(dto.userId);
        if (user.pendingFriends.includes(friend.id)) {
            user.friends.push(friend.id);
            friend.friends.push(user.id);
            user.pendingFriends = user.pendingFriends.filter((id) => id !== friend.id);
            this.userRepository.save(user);
            this.userRepository.save(friend);
        }
    }

    declineFriendRequest(user : User, request : User) : void {
        if (user.pendingFriends.includes(request.id)) {
            user.pendingFriends = user.pendingFriends.filter((id) => id !== request.id);
            this.userRepository.save(user);
        }
    }

    deleteFriend(user : User, friend : User) {
        if (user.friends.includes(friend.id)) {
            user.friends = user.friends.filter((id) => id !== friend.id);
            friend.friends = friend.friends.filter((id) => id !== user.id);
            this.userRepository.save(user);
            this.userRepository.save(friend);
        }
    }

    sendFriendRequest(user : User, friend : User) : void {
        if (user.id === friend.id || friend.bannedUsers.includes(user.id) ||
            user.friends.includes(friend.id) || friend.pendingFriends.includes(user.id))
            return;

        friend.pendingFriends.push(user.id);
        this.userRepository.save(friend);
    }

    //Black List
    isBanned(user : User, userToCheck : User) : boolean {
        if (user.bannedUsers.includes(userToCheck.id))
            return true;
        return false;
    }

    banUser(user : User, userToBan : User) : void {
        if (user.id === userToBan.id || this.isBanned(user, userToBan))
            return;
        this.declineFriendRequest(user, userToBan);
        this.declineFriendRequest(userToBan, user);
        this.deleteFriend(user, userToBan);
        user.bannedUsers.push(userToBan.id);
        this.userRepository.save(user);
    }

    unbanUser(user : User, userToUnban : User) : void {
        if (this.isBanned(user, userToUnban)) {
            user.bannedUsers = user.bannedUsers.filter((banneduser) => banneduser !== userToUnban.id);
            this.userRepository.save(user);
        }
    }

    //GAME
    wonGame(user : User, matchId : number) : void {
        user.matchHistory.push(matchId);
        user.wins += 1;
        user.score += 3;
        this.userRepository.save(user);
    }

    draw(user : User, matchId : number) : void {
        user.matchHistory.push(matchId);
        user.draws += 1;
        user.score += 1;
        this.userRepository.save(user);
    }

    lostGame(user : User, matchId : number) : void {
        user.matchHistory.push(matchId);
        user.losses += 1;
        this.userRepository.save(user);
    }

    //CHAT
    async addChat (user : User, chat : number) : Promise<void> {
        if (!user.chats.includes(chat)) {
            user.chats.push(chat);
            await this.userRepository.save(user);
        }
    }

    async deleteChat (userId : number, chat : number) : Promise<void> {
        const user = await this.findById(userId);
        user.chats = user.chats.filter(chatId => chatId !== chat);
        this.userRepository.save(user);
    }

	//TwoFactorAuthentication
	async setTwoFactorAuthenticationSecret(secret: string, Id: number) {
		return this.userRepository.update(Id, {TwoFactorAuthenticationSecret: secret});
	}

	async unsetTwoFactorAuthenticationSecret(Id: number) {
		return this.userRepository.update(Id, {TwoFactorAuthenticationSecret: null});
	}

	async enableTwoFactorAuthentication(Id: number) {
		return this.userRepository.update(Id, {isTwoFactorAuthenticationEnabled: true});
	}

	async disableTwoFactorAuthentication(Id: number) {
		return this.userRepository.update(Id, {isTwoFactorAuthenticationEnabled: false});
	}
}