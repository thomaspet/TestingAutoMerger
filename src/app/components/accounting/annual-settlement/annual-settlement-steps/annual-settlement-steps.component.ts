import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {tap} from 'rxjs/operators';

@Component({
    selector: 'annual-settlement-steps-component',
    templateUrl: './annual-settlement-steps.component.html'
})
export class AnnualSettlementStepsComponent implements OnInit {
    annualSettlements$: Observable<any>;
    selectedAnnualSettlement$ = new BehaviorSubject(null);
    constructor(private service: AnnualSettlementService) {

    }

    ngOnInit() {
        this.annualSettlements$ = this.service.getAnnualSettlements().pipe(
            tap(as => this.selectedAnnualSettlement$.next(as[as.length - 1]))
        );
    }
    onSelectAnnualSettlement(annualSettlement) {
        this.selectedAnnualSettlement$.next(annualSettlement);
    }
}
