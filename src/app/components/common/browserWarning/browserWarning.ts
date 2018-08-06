import {Component} from '@angular/core';
import {BrowserStorageService} from '@uni-framework/core/browserStorageService';

@Component({
    selector: 'browser-warning',
    template: `
    <article role="alert" *ngIf="showBrowserWarning">
        <h1>Nettleseren støttes ikke</h1>

        <p>Det ser dessverre ut som om du bruker en eldre nettleser, som ikke lenger støttes av Uni Economy.</p>

        <p>Vi anbefaler på det sterkeste at du oppdaterer til siste versjon av
        nettleseren din, eller bytter til en moderne nettleser, som for
        eksempel <a href="https://www.google.com/chrome/">Google Chrome</a>.</p>

        <button type="button" (click)="hide()">Ignorer</button>

    </article>
    <div class="backface" *ngIf="showBrowserWarning"></div>
    `
})
export class BrowserWarning {
    public showBrowserWarning: boolean = false;

    constructor(
        private browserStorage: BrowserStorageService,
    ) {}

    public ngOnInit() {
        const userAgent = navigator.userAgent;

        // IE 11
        const isIE11 = (userAgent.indexOf('Trident') !== -1 && userAgent.indexOf('rv:11') !== -1);

        // IE >= 10
        const isIE10 = (navigator.appVersion.indexOf('MSIE') !== -1 && !isIE11);

        // See if we're already hiding the warning this session
        if (this.browserStorage.getSessionItem('hideBrowserWarning') !== true) {
            const unsupportedBrowser = isIE10 || isIE11;
            this.showBrowserWarning = unsupportedBrowser;
        }
    }

    public hide() {
        if (window.confirm('Er du sikker? Uni Economy vil kanskje ikke virke som forventet i denne nettleseren.')) {
            this.showBrowserWarning = false;
            this.browserStorage.setSessionItem('hideBrowserWarning', true);
        }
    };
}
