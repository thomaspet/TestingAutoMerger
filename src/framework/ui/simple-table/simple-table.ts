import {Component, ElementRef} from '@angular/core';
import PerfectScrollbar from 'perfect-scrollbar';

@Component({
    selector: 'simple-table',
    styleUrls: ['./simple-table.sass'],
    template: `
        <table>
            <ng-content></ng-content>
        </table>
    `
})
export class SimpleTable {
    scrollbar: PerfectScrollbar;

    constructor(private elementRef: ElementRef) {}

    ngAfterViewInit() {
        if (this.elementRef?.nativeElement) {
            this.scrollbar = new PerfectScrollbar(this.elementRef.nativeElement, {wheelPropagation: true});
        }
    }

    ngOnDestroy() {
        this.scrollbar?.destroy();
    }
}
