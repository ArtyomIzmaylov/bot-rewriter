import {ContentRewriterInterface} from "./content.rewriter.interface";
import {ChannelsToRewriteModel} from "./model/channels-to-rewrite.model";
import {RewrittenContentModel} from "./model/rewritten-content.model";
import {ContentAgencyClientInterface} from "../client/content-agency.client.interface";
import {LinkModel} from "../model/link/link.model";

export class ContentRewriter implements ContentRewriterInterface {
    constructor(private url : LinkModel,  private client : ContentAgencyClientInterface) {
    }
    async rewrite(channelsToRewrite: ChannelsToRewriteModel): Promise<RewrittenContentModel> {
        const response = this.client.rewriteContent({
            url : this.url,
            body: {
                links : channelsToRewrite.channelsToRewrite
            }
        })
        return
    }
}