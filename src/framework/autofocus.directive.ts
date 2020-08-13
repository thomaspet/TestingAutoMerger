import {Directive, ElementRef} from '@angular/core';

@Directive({selector: '[uniAutoFocus]'})
export class AutoFocusDirective {

    constructor(private elementRef: ElementRef) {}

    ngAfterViewInit() {
        try {
            const el: HTMLElement = this.elementRef.nativeElement;
            if (el.tagName === 'FORM') {
                const input = el.querySelector('input');
                input?.focus();
            } else {
                this.elementRef.nativeElement.focus();
            }
        } catch (e) {}
    }
}
