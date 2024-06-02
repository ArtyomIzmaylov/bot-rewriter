import {Ctx, Hears, Update} from "nestjs-puregram";
import {MessageContext} from "puregram";
import {StepContext} from "@puregram/scenes";


@Update()
export class AppController {

    @Hears('/channels')
    async signup(@Ctx() context: MessageContext & StepContext): Promise<unknown> {
        return context.scene.enter('AddChannels');
    }
}