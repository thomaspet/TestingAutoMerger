import {Component, Input, Output, OnChanges, EventEmitter} from '@angular/core';

@Component({
    selector: 'unitable-pagination',
    template: `
        <nav role="navigation">
        <ul>
            <li>
                <button class="pagination_prev" (click)="previous()" [disabled]="currentPage === 1">Previous page</button>
            </li>

            <ul *ngIf="pageCount <= 10">
                <li *ngFor="let page of pages">
                    <button class="pagination_page" (click)="goToPage(page)" [ngClass]="{'-is-active': page === currentPage}">{{page}}</button>
                </li>
            </ul>
            <li *ngIf="pageCount > 10">
                <input class="pagination_goToPage" type="number" #pageInput [ngModel]="currentPage" (keydown.enter)="goToPage(pageInput.value)">
            </li>

            <li>
                <button class="pagination_next" (click)="next()" [disabled]="currentPage === pageCount">Next page</button>
            </li>
        </ul>

    </nav>
    `,
})
export class UniTablePagination implements OnChanges {
    public currentPage: number = 1;
    public pageCount: number;
    private pages: number[];

    @Input()
    private pageSize: number;

    @Input()
    private rowCount: number;

    @Output()
    private pageChange: EventEmitter<any> = new EventEmitter();


    public ngOnChanges() {
        if (this.pageSize && this.rowCount) {
            this.pageCount = Math.ceil(this.rowCount / this.pageSize) || 1;
            if (this.pageCount <= 10) {
                this.pages = [];
                for (let i = 1; i <= this.pageCount; i++) {
                    this.pages.push(i);
                }
            }
        } else {
            this.pages = [1];
        }
    }

    public previous() {
        this.currentPage--;
        this.pageChange.emit(this.currentPage);
    }

    public next() {
        this.currentPage++;
        this.pageChange.emit(this.currentPage);
    }

    public goToPage(page) {
        this.currentPage = page;
        this.pageChange.emit(page);
    }

}
