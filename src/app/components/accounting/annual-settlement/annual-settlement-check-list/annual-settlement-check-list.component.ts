import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {map, takeUntil} from 'rxjs/operators';
import {forkJoin, Subject} from 'rxjs';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {options, warningTexts} from './checklistoptions';
@Component({
    selector: 'annual-settlement-check-list-component',
    templateUrl: './annual-settlement-check-list.component.html'
})
export class AnnualSettlementCheckListComponent {
    onDestroy$ = new Subject();
    options = options;
    warningTexts = warningTexts;

    constructor(private route: ActivatedRoute, private service: AnnualSettlementService) {}

    ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.service.getAnnualSettlement(id).subscribe(as => console.log(as));
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
