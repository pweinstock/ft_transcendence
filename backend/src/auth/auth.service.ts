import { Injectable } from "@nestjs/common";
import { UserDTO } from "src/users/dto/user.dto";
import { User } from "src/users/user.entity";
import { UserService } from "src/users/user.service";
import * as os from "os";

@Injectable()
export class AuthService {
	constructor (
		private userService: UserService,
	) {}

	async validateUser(dto: UserDTO): Promise<User> {
		return this.userService.createUser(dto);
	}
}