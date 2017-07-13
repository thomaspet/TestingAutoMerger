import {Directive, ElementRef, Output, EventEmitter} from '@angular/core';

@Directive({
    selector: '[clickOutside]'
})
export class ClickOutsideDirective {
    @Output()
    public clickOutside: EventEmitter<any> = new EventEmitter();

    constructor (private elementRef: ElementRef) {}

    public ngAfterViewInit() {
        // Allow any click that opened the host component
        // to propagate before setting up.
        // Because we dont want that click to trigger close as well
        setTimeout(() => {
            document.addEventListener('click', this.clickHandler.bind(this));
        });
    }

    public clickHandler(event: MouseEvent) {
        if (!event || !event.target) {
            return;
        }

        if (!this.elementRef.nativeElement.contains(event.target)) {
            this.clickOutside.emit(true);
        }
    }

    public ngOnDestroy() {
        document.removeEventListener('click', this.clickHandler);
    }
}
