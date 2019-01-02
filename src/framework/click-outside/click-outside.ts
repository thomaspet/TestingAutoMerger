import {Directive, ElementRef, Output, EventEmitter} from '@angular/core';
import {fromEvent, Subscription} from 'rxjs';

@Directive({
    selector: '[clickOutside]'
})
export class ClickOutsideDirective {
    @Output() clickOutside: EventEmitter<any> = new EventEmitter();

    eventSubscription: Subscription;

    constructor (private elementRef: ElementRef) {}

    ngAfterViewInit() {
        // Timeout to alow any click that opened the host component
        // to propagate before setting up.
        // Because we dont want that click to trigger close as well
        setTimeout(() => {
            this.eventSubscription = fromEvent(document, 'click').subscribe(
                (event: MouseEvent) => this.onClick(event)
            );
        });
    }

    ngOnDestroy() {
        this.eventSubscription.unsubscribe();
    }

    public onClick(event: MouseEvent) {
        const targetElement = <HTMLElement> event.target;
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
