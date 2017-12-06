import {Component} from '@angular/core';

@Component({
    selector: 'uni-init',
    templateUrl: './init.html',
})
export class UniInit {
    private registrationFormExpanded: boolean;
    private marketingContentHidden: boolean;
    public currentYear: number; // used in copyright footer

    constructor() {
        this.currentYear = new Date().getFullYear();

        // Try/catch to avoid crashing the app when localstorage has no entry
        try {
            this.marketingContentHidden = JSON.parse(localStorage.getItem('marketingContent_hidden'));
        } catch (e) {}
    }

    public toggleMarketingContent() {
        this.marketingContentHidden = !this.marketingContentHidden;
        localStorage.setItem('marketingContent_hidden', JSON.stringify(this.marketingContentHidden));
        this.registrationFormExpanded = false;
    }
}
