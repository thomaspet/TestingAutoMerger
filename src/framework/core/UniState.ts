import {Injectable} from 'angular2/core';
import {Router} from 'angular2/router';

@Injectable()
export class UniState {
    public store: any;

    constructor(public router: Router) {
        var w: any = window;
        w.state = w.state || {};
        this.store = w.state;
    };

    saveState(state:any) {
        this.store[this.router.root.lastNavigationAttempt] = state;
    }

    getState() {
        return this.store[this.router.root.lastNavigationAttempt];
    }
}
