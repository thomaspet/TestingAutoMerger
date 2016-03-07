import {Injectable, Inject} from "angular2/core";
import {UniHttp} from "./../core/http/http";

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