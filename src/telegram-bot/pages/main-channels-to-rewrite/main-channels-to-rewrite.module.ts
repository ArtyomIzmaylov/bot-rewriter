import {Module} from "@nestjs/common";
import {ContentRewriterModule} from "../../../rewriter/content.rewriter.module";
import {MainChannelsToRewrite} from "./main-channels-to-rewrite";
import {UserRepositoryModule} from "../../../repository/user/user.repository.module";

@Module({
    imports : [ContentRewriterModule, UserRepositoryModule],
    providers: [MainChannelsToRewrite]
})
export class MainChannelsToRewriteModule {

}