import {Directive, ElementRef, Output, EventEmitter, HostListener} from '@angular/core';

@Directive({
    selector: '[clickOutside]'
})
export class ClickOutsideDirective {
    @Output() clickOutside: EventEmitter<any> = new EventEmitter();

    hostViewInitialized: boolean;

    constructor(private elementRef: ElementRef) {}

    ngAfterViewInit() {
        setTimeout(() => {
            this.hostViewInitialized = true;
        });
    }

    @HostListener('document:click', ['$event.target'])
    public onClick(targetElement) {
        if (this.hostViewInitialized && targetElement) {
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
}
