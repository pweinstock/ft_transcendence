import {HttpException, HttpStatus, Injectable, Res} from '@nestjs/common';
import { UserDTO } from './dto/user.dto';
import {User} from "./user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import { join } from 'path';
import { Observable, of } from 'rxjs';
import {UserInfoDto} from "./dto/user-info.dto";

@Injectable()
export class UserService {
    constructor(@InjectRepository(User) private userRepository : Repository<User>) {}

    async createUser(dto: UserDTO): Promise<User> {
        if (!dto.email || !dto.displayName)
            throw new HttpException('Required information was not provided!', HttpStatus.BAD_REQUEST);
        const existingUser = await this.userRepository.findOneBy({email: dto.email});
        if (existingUser)
            return existingUser;
        const user = this.userRepository.create(dto);
        user.bannedUsers = [];
        user.pendingFriends = [];
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

    async findById(userId: string): Promise<User> {
        const user = await this.userRepository.findOneBy({id: userId});
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        return user;
    }

    async findByName(name: string): Promise<User> {
        const user = await this.userRepository.findOneBy({displayName: name});
        if (!user)
            throw new HttpException('User not found!', HttpStatus.NOT_FOUND);
        return user;
    }


    async remove(user: User) : Promise<void> {
        await this.userRepository.remove(user);
    }//todo need to implement?

    //USER INFO
    async changeName(id: string, newName: string) : Promise<any> {
        try {
            await this.userRepository.update(id, { displayName: newName});
            await this.userRepository.update(id, {first: false});
        } catch (e) {
            throw new HttpException("Username already exists!", HttpStatus.CONFLICT);
        }
    }

    async uploadAvatar(id: string, filename: string) : Promise<any> {
        return this.userRepository.update(id, {photo: filename});
    }

    deleteImage(imagename: string) : void {
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
        if (imagename === 'null' || imagename === 'undefined')
            return of(res.sendFile(join(process.cwd(), './uploads/image/' + 'littleman.png')));
        return of(res.sendFile(join(process.cwd(), './uploads/image/' + imagename)));
    }

    async changeStatus(name : string, status : string) : Promise<void> {
        const user = await this.userRepository.findOneBy({displayName: name});
        if (user) {
            user.status = status;
            this.userRepository.save(user);
        }
    }

    //FRIEND LIST
    async acceptFriendRequest(user : User, friendId : string) : Promise<void> {
        const friend = await this.findById(friendId);
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

    deleteFriend(user : User, friend : User) : void {
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
    async wonGame(displayname : string, matchId : string) : Promise<void> {
        const user = await this.userRepository.findOneBy({displayName: displayname});
        if (user) {
            user.matchHistory.push(matchId);
            user.wins += 1;
            user.score += 3;
            if (user.status != "offline")
                user.status = "online";
            this.userRepository.save(user);
        }
    }

    async draw(displayname : string, matchId : string) : Promise<void> {
        const user = await this.userRepository.findOneBy({displayName : displayname});
        if (user) {
            user.matchHistory.push(matchId);
            user.draws += 1;
            user.score += 1;
            if (user.status != "offline")
                user.status = "online";
            this.userRepository.save(user);
        }
    }

    async lostGame(displayname : string, matchId : string) : Promise<void> {
        const user = await this.userRepository.findOneBy({displayName: displayname});
        if (user) {
            user.matchHistory.push(matchId);
            user.losses += 1;
            if (user.status != "offline")
                user.status = "online";
            this.userRepository.save(user);
        }
    }

    //CHAT
    async addChat (user : User, chat : string) : Promise<void> {
        if (!user.chats.includes(chat)) {
            user.chats.push(chat);
            await this.userRepository.save(user);
        }
    }

    async deleteChat (userId : string, chat : string) : Promise<void> {
        const user = await this.findById(userId);
        user.chats = user.chats.filter(chatId => chatId !== chat);
        this.userRepository.save(user);
    }

	//TwoFactorAuthentication
	async setTwoFactorAuthenticationSecret(secret: string, Id: string) {
		return this.userRepository.update(Id, {TwoFactorAuthenticationSecret: secret});
	}

	async unsetTwoFactorAuthenticationSecret(Id: string) {
		return this.userRepository.update(Id, {TwoFactorAuthenticationSecret: null});
	}

	async enableTwoFactorAuthentication(Id: string) {
		return this.userRepository.update(Id, {isTwoFactorAuthenticationEnabled: true});
	}

	async disableTwoFactorAuthentication(Id: string) {
		return this.userRepository.update(Id, {isTwoFactorAuthenticationEnabled: false});
	}

	//USER SOCKET INTERRACTION!
    private clientToUser = new Map<string, string>();

    isConnected(clientId : string) : boolean {
        if (this.clientToUser.has(clientId))
            return true;
        return false;
    }

    async userConnect(clientId : string, dto : UserInfoDto) : Promise<void> {
        if (this.isConnected(clientId))
            return;
        const user = await this.userRepository.findOneBy({id: dto.userId});
        if (user) {
            this.clientToUser.set(clientId, user.id);
            user.status = "online";
            await this.userRepository.save(user);
        }
        else
            this.clientToUser.delete(clientId);
    }

    async userDisconnect(clientId : string) : Promise<void> {
        const userId = this.clientToUser.get(clientId);
        if (userId) {
            const user = await this.userRepository.findOneBy({id: userId});
            if (user) {
                user.status = "offline";
                await this.userRepository.save(user);
            }
            this.clientToUser.delete(clientId);
        }
    }
}