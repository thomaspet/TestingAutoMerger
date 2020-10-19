import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { WageTypeService } from '@app/services/services';

@Component({
    selector: 'uni-wage-type-empty-state',
    templateUrl: './wage-type-empty-state.component.html',
    styleUrls: ['./wage-type-empty-state.component.sass']
})
export class WageTypeEmptyStateComponent implements OnInit {
    @Output() wagetypeUpdated: EventEmitter<any> = new EventEmitter();
    busy: boolean;

    constructor(private wageTypeService: WageTypeService) { }

    ngOnInit(): void {

    }

    updateWageTypes() {
        this.busy = true;
        this.wageTypeService
            .syncWagetypes()
            .subscribe(() => this.wagetypeUpdated.next());
    }

}
