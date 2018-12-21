import {Directive, ElementRef, Output, EventEmitter, HostListener} from '@angular/core';

@Directive({
    selector: '[clickOutside]'
})
export class ClickOutsideDirective {
    @Output()
    public clickOutside: EventEmitter<any> = new EventEmitter();

    constructor (private elementRef: ElementRef) {}

    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement) {
        if (!targetElement) {
            return;
        }

        try {
            // Avoid closing on angular material/cdk overlays
            if (targetElement.classList.contains('cdk-overlay-backdrop')) {
                return;
            }

            if (!this.elementRef.nativeElement.contains(targetElement)) {
                this.clickOutside.emit(null);
            }
        } catch (e) {}
    }
}
