import { ValidationPipe } from "@nestjs/common";
import {NestFactory} from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import {AppModule} from "./app.module";

async function start() {
    const PORT = process.env.PORT || 5000;
    // const IP = ' 10.13.2.4';
    const app = await NestFactory.create(AppModule)

    // const config = new DocumentBuilder()

	app.enableCors({
		origin: true,
		credentials: true,
	});

	app.use(cookieParser());

	app.useGlobalPipes(new ValidationPipe);

	await app.listen(PORT, () => console.log('Server started on port = ', PORT))
}

start()