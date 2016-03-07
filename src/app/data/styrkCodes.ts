import {Injectable, Inject} from "../../../node_modules/angular2/core.d";
import {UniHttp} from "../../framework/core/http";

@Injectable()
export class STYRKCodesDS {

    constructor(@Inject(UniHttp)
                public http: UniHttp) {
    }

    getCodes() {
        return this.http
            .usingBusinessDomain()
            .asGET()
            .withEndPoint("STYRK/")
            .send();
    }

}