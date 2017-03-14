import {Pipe} from '@angular/core';
import {ErrorService} from '../services/services';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';

@Pipe({name: 'safehtml'})
export class UniSafeHtml {
    constructor(private sanitizer: DomSanitizer, private errorService: ErrorService) {}

    public transform(html): SafeHtml {
        try {
            return this.sanitizer.bypassSecurityTrustHtml(html);
        } catch (err) {
            this.errorService.handle(err);
        }
    }
}
