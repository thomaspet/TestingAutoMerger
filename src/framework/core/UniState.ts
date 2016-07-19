import {Injectable} from '@angular/core';
import {Router} from '@angular/router';

@Injectable()
export class UniState {
    public store: any;

    constructor(public router: Router) {
        this.store = {};
    };

    saveState(state:any) {
        this.store[this.router.url] = state;
    }

    getState() {
        return this.store[this.router.url];
    }
}
