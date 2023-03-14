import {NestFactory} from "@nestjs/core";
import {AppModule} from "./app.module";


async function start() {
    const PORT = process.env.PORT || 5000;
    // const IP = ' 10.13.2.4';
    const app = await NestFactory.create(AppModule)

    // const config = new DocumentBuilder()
    
    await app.listen(PORT, () => console.log('Server started on port = ', PORT))
}

start()