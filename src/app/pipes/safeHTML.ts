import * as browser from '@angular/platform-browser';
import {Pipe} from '@angular/core';
import {ErrorService} from '../services/common/ErrorService';

@Pipe({name: 'safehtml'})
export class SafeHtml {
    constructor(private sanitizer: browser.DomSanitizer, private errorService: ErrorService) {}

    public transform(html): browser.SafeHtml {
        try {
            return this.sanitizer.bypassSecurityTrustHtml(html);
        } catch (err) {
            this.errorService.handle(err);
        }
    }
}
