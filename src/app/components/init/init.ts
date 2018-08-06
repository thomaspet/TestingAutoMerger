import {Component} from '@angular/core';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

@Component({
    selector: 'uni-init',
    templateUrl: './init.html',
})
export class UniInit {
    public marketingContentHidden: boolean;
    public currentYear: number; // used in copyright footer

    constructor(private browserStorage: BrowserStorageService) {
        this.currentYear = new Date().getFullYear();

        // Try/catch to avoid crashing the app when localstorage has no entry
        try {
            this.marketingContentHidden = browserStorage.getItem('marketingContent_hidden');
        } catch (e) {}
    }

    public toggleMarketingContent() {
        this.marketingContentHidden = !this.marketingContentHidden;
        this.browserStorage.setItem('marketingContent_hidden', this.marketingContentHidden);
    }
}
