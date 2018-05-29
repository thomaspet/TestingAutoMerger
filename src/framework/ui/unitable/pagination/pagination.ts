import {Component, Input, Output, OnChanges, EventEmitter} from '@angular/core';

@Component({
    selector: 'unitable-pagination',
    template: `
        <section class="pagination" *ngIf="pageCount > 1">
            <i class="material-icons" (click)="paginate('first')">first_page</i>
            <i class="material-icons" (click)="paginate('prev')">keyboard_arrow_left</i>

            <span class="pagination-info">
                Side
                <input type="text" #pageInput
                    [value]="currentPage"
                    (change)="goToPage(pageInput.value)"
                />
                av {{pageCount}}
            </span>

            <i class="material-icons" (click)="paginate('next')">keyboard_arrow_right</i>
            <i class="material-icons" (click)="paginate('last')">last_page</i>
        </section>
    `,
})
export class UniTablePagination implements OnChanges {
    public currentPage: number = 1;
    public pageCount: number;
    // private pages: number[];

    @Input()
    private pageSize: number;

    @Input()
    private rowCount: number;

    @Output()
    private pageChange: EventEmitter<any> = new EventEmitter();


    public ngOnChanges() {
        if (this.pageSize && this.rowCount) {
            this.pageCount = Math.ceil(this.rowCount / this.pageSize) || 1;
        }
    }

    public paginate(action: 'next' | 'prev' | 'first' | 'last') {
        switch (action) {
            case 'first':
                if (this.currentPage !== 1) {
                    this.currentPage = 1;
                    this.pageChange.emit(this.currentPage);
                }
            break;
            case 'last':
                if (this.currentPage !== this.pageCount) {
                    this.currentPage = this.pageCount;
                    this.pageChange.emit(this.currentPage);
                }
            break;
            case 'next':
                if (this.currentPage < this.pageCount) {
                    this.currentPage++;
                    this.pageChange.emit(this.currentPage);
                }
            break;
            case 'prev':
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.pageChange.emit(this.currentPage);
                }
            break;
        }
    }
    public goToPage(page: number) {
        if (page > 0 && page <= this.pageCount) {
            this.currentPage = page;
            this.pageChange.emit(this.currentPage);
        }
    }
}
