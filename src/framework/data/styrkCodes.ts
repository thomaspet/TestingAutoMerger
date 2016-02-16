import {Injectable, Inject} from 'angular2/core';
import {UniHttpService} from "./uniHttpService";

@Injectable()
export class STYRKCodesDS {
    
    constructor(
        @Inject(UniHttpService)
        public http:UniHttpService) { }
    
    getCodes() {
        return this.http.get({
            resource: "STYRK/"
        });
    }
    
}