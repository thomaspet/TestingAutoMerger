import {Component, ElementRef, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges} from '@angular/core';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'uni-value-loader',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: ''
})
export class ValueLoader implements OnChanges {
    @Input() public value: Observable<any>;

    constructor(private element: ElementRef) {}

    ngOnChanges(changes: SimpleChanges) {
        if (changes['value']) {
            const el = this.element.nativeElement;
            if (changes['value'].currentValue) {

                el.innerHTML = 'Loading...';
                el.setAttribute('aria-busy', true);
                this.value.subscribe(
                    result => {
                        el.innerHTML = result;
                        el.setAttribute('aria-busy', false);
                    }
                )
            } else {
                el.innerHTML = '';
                el.setAttribute('aria-busy', false);
            }
        }
    }
}
