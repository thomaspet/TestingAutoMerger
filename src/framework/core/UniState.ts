import {Injectable} from '@angular/core';
import {Router} from '@angular/router-deprecated';

@Injectable()
export class UniState {
    public store: any;

    constructor(public router: Router) {
        this.store = {};
    };

    saveState(state:any) {
        this.store[this.router.root.lastNavigationAttempt] = state;
    }

    getState() {
        return this.store[this.router.root.lastNavigationAttempt];
    }
}
