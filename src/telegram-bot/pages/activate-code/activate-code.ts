import {AddStep, Ctx, Scene, SceneEnter} from "nestjs-puregram";
import {TelegramContextModel} from "../../model/telegram-context-model";
import {StepContext} from "@puregram/scenes";
import {ACTIVATE_CODE, ADD_CHANNELS_PROMO, MAIN_CHANNEL_PAGE, START} from "../pages.types";


export interface ActivateCodeInterface extends Record<string, any> {
    activateCode : string
}

export type ActivateCodeScene = TelegramContextModel & StepContext<ActivateCodeInterface>

@Scene(ACTIVATE_CODE)
export class ActivateCode {
    @SceneEnter()
    async sceneEnter(@Ctx() telegramContext : ActivateCodeScene) {
        telegramContext.scene.state.activateCode = 'admin'
    }

    @AddStep(0)
    async zeroStep(@Ctx() telegramContext : ActivateCodeScene) {
        if (telegramContext.scene.step.firstTime) {
            await telegramContext.send('Оплатите по ссылке https://localhost:/api/subcribe и введите код(код - admin).')
        }
        if (telegramContext.scene.state.activateCode === telegramContext.text) {
            await telegramContext.send('Верный код')
            await telegramContext.scene.enter(ADD_CHANNELS_PROMO)
        }
        else {
            await telegramContext.send('Повторите попытку', {
                reply_markup : {
                    resize_keyboard : true,
                    keyboard : [[{text : 'Ссылка на лендинг https://localhost:/api/subcribe'}]]
                }
            })
        }

    }

}