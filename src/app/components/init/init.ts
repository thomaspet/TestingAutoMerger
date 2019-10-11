import {Component} from '@angular/core';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';
import {theme} from 'src/themes/theme';

@Component({
    selector: 'uni-init',
    templateUrl: './init.html',
})
export class UniInit {
    theme = theme;
    logoUrl = theme.login_logo;
    background = `url(${theme.login_background})`;

    marketingContentHidden: boolean;

    constructor(private browserStorage: BrowserStorageService) {
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
