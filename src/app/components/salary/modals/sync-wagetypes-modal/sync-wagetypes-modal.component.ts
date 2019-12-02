import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IUniModal, IModalOptions } from '@uni-framework/uni-modal';
import { WageTypeService } from '@app/services/services';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'uni-sync-wagetypes-modal',
    templateUrl: './sync-wagetypes-modal.component.html',
    styleUrls: ['./sync-wagetypes-modal.component.sass']
})
export class SyncWagetypesModalComponent implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<boolean> = new EventEmitter<boolean>();
    busy: boolean;
    message$: BehaviorSubject<string> = new BehaviorSubject('');
    constructor(
        private wageTypeService: WageTypeService
    ) { }

    ngOnInit() {
        this.options.cancelValue = false;
        this.options.closeOnClickOutside = false;
        this.options.closeOnEscape = false;
        this.message$.next(this.startMessage(this.options.data));
    }

    close(canActivate: boolean) {
        this.onClose.next(canActivate);
    }

    sync() {
        this.message$.next(this.loadMessage());
        this.busy = true;
        this.wageTypeService
            .syncWagetypes()
            .pipe(
                finalize(() => this.busy = false)
            )
            .subscribe(() => this.close(true));
    }

    startMessage(year: number) {
        return `Vi må hente lønnsarter for ${year} før du kan fortsette`;
    }

    loadMessage() {
        return 'Henter lønnsarter. Sender deg videre når det er ferdig';
    }

}
