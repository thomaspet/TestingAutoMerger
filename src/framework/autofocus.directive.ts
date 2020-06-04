import {Directive, ElementRef} from '@angular/core';

@Directive({selector: '[uniAutoFocus]'})
export class AutoFocusDirective {

    constructor(private elementRef: ElementRef) {}

    ngAfterViewInit() {
        try {
            this.elementRef.nativeElement.focus();
        } catch (e) {}
    }
}
