import {UniHttp} from "../../framework/core/http/http";
import {Injectable, Inject} from "@angular/core";

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