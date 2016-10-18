import {DomSanitizer} from '@angular/platform-browser';
import {Pipe} from '@angular/core';

@Pipe({name: 'safehtml'})
export class SafeHtml {
    constructor(private sanitizer: DomSanitizer) {}

    transform(html) {
        return this.sanitizer.bypassSecurityTrustHtml(html);
    }
}
