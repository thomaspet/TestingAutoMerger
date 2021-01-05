import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ErrorService, WageTypeService } from '@app/services/services';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'uni-wage-type-empty-state',
    templateUrl: './wage-type-empty-state.component.html',
    styleUrls: ['./wage-type-empty-state.component.sass']
})
export class WageTypeEmptyStateComponent implements OnInit {
    @Output() wagetypeUpdated: EventEmitter<any> = new EventEmitter();
    busy: boolean;

    constructor(
        private wageTypeService: WageTypeService,
        private errorService: ErrorService,
    ) { }

    ngOnInit(): void {

    }

    updateWageTypes() {
        this.busy = true;
        this.wageTypeService
            .syncWagetypes()
            .pipe(
                finalize(() => this.busy = false),
            )
            .subscribe(
                () => this.wagetypeUpdated.next(),
                err => this.errorService.handle(err),
            );
    }

}
