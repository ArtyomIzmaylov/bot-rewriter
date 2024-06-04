import {AddStep, Ctx, Scene, SceneEnter, SceneLeave} from "nestjs-puregram";
import {MessageContext} from "puregram";
import {StepContext} from "@puregram/scenes";
import {SessionInterface} from "@puregram/session";
import {ChannelMockRepository} from "../../repository/channel/channel-mock.repository";
import {ContentRewriterInterface} from "../../rewriter/content.rewriter.interface";
import {UserChannel} from "../../repository/channel/channel.model";
import {Inject} from "@nestjs/common";

interface RewriteContentInterface extends Record<string, any>{
    userChannels : UserChannel[]
    chosenChannel : UserChannel
}



@Scene('RewriteContent')
export class RewriteContentHandler {
    constructor(
        @Inject('CUSTOM_MOCK_REPOSITORY') private readonly repository : ChannelMockRepository,
        @Inject('CUSTOM_CONTENT_REWRITER') private readonly rewriter : ContentRewriterInterface,
        ) {

    }

    private async sendContentInChunks(rewrittenContent: string, @Ctx() context: MessageContext, interval: number) {
        //Приватный метод, который позволяет обойти ограничение телегарма в 4000 символомов.
        let startIndex = 0;
        const sendChunks = async function* () {
            while (startIndex < rewrittenContent.length) {
                const endIndex = Math.min(startIndex + 4000, rewrittenContent.length);
                const chunk = rewrittenContent.substring(startIndex, endIndex);
                await context.send(chunk);
                startIndex = endIndex;
                yield;
                if (startIndex < rewrittenContent.length) {
                    await new Promise(resolve => setTimeout(resolve, interval));
                }
            }
        };

        for await (const _ of sendChunks()) {
            // Блок будет выполнен после отправки каждого чанка
        }

        await context.send(`Поздравляю, вы успешно переписали контент. \n\n<i>(P.S Вам отдался контент с выбранных телеграм каналов. Сервис для переписывания ещё не работает😓😓😓. Можете контент вставить в ChatGPT или другую нейросеть😉</i>)`, { parse_mode: "HTML" });
    }
    @SceneEnter()
    async enter(@Ctx() context: MessageContext & StepContext<RewriteContentInterface>): Promise<unknown> {
        if (context.scene.step.firstTime) {
            context.scene.state.userChannels = (await this.repository.findById(context.from.id)).userChannels
            return context.send('Welcome!');
        }
    }
    @SceneLeave()
    async leave(@Ctx() context: MessageContext & StepContext<RewriteContentInterface>): Promise<void> {

        const rewrittenContent  = (await this.rewriter.rewrite({
            channelsToRewrite : context.scene.state.chosenChannel.channelsToRewrite
        })).rewrittenContent
        await this.sendContentInChunks(rewrittenContent, context, 2000)
    }
    @AddStep(1)
    async userChannel(@Ctx() context: MessageContext & SessionInterface  & StepContext<RewriteContentInterface>): Promise<unknown> {
        if (context.scene.step.firstTime || !context.hasText) {
            const userChannels = context.scene.state.userChannels.map((channel, i) => {
                const rewrittenChannels = (channel.channelsToRewrite.map(chn=>chn.link).join('\n— '))
                return `<b>➡️    ${channel.userChannel.link}    ⬅️</b>: \n\n\n <i>Это каналы откуда будет переписываться контент. Вы их ранее добавили.\n\n — ${rewrittenChannels} \n</i>`
            }).join('\n')
            return await context.send(`Выбери свой телеграм канал и отправь ссылку\n\n${userChannels}\n(P.S.Хранилище каналов ещё не сделано, представим, что добавленные каналы оттуда прилетают)`, {
                parse_mode : 'HTML'
            });

        }
        const chosenChannel = context.scene.state.userChannels.find(chn => {
            if (chn.userChannel.link === context.text) {
                return chn
            }
        })

        if (!chosenChannel) {
            await context.send('Некорректная ссылка. Введите канал, предоженный из списка')
        }
        else {
            context.scene.state.chosenChannel = chosenChannel
            return await context.scene.step.next()
        }

    }

}