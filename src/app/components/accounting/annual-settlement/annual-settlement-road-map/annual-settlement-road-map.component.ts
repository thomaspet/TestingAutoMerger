import {Component, OnInit} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {switchMap, tap} from 'rxjs/operators';
import steps from '../annual-settlement-steps-data';
import {FinancialYearService} from '@app/services/accounting/financialYearService';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'annual-settlement-road-map-component',
    templateUrl: './annual-settlement-road-map.component.html'
})
export class AnnualSettlementRoadMapComponent implements OnInit {
    annualSettlements$: Observable<any>;
    selectedAnnualSettlement$ = new BehaviorSubject(null);
    steps = steps;
    constructor(
        private annualSettlementService: AnnualSettlementService,
        private financialYearService: FinancialYearService,
        private toast: ToastService
    ) {

    }

    ngOnInit() {
        const year = this.financialYearService.getActiveYear();
        this.annualSettlements$ = this.annualSettlementService.getAnnualSettlements().pipe(
            switchMap((as: any[]) => {
                if (as.length === 0) {
                    if (year < 2020) {
                        this.toast.addToast('Invalid Financial Year. Must be at least 2020', ToastType.warn);
                        return of([]);
                    }
                    return this.annualSettlementService.createFinancialYear(year)
                        .pipe(switchMap(() => this.annualSettlementService.getAnnualSettlements()));
                } else {
                    const currentAS = as.find(it => it.Year === year);
                    if (!currentAS) {
                        return this.annualSettlementService.createFinancialYear(year)
                            .pipe(switchMap(() => this.annualSettlementService.getAnnualSettlements()));
                    }
                }
                return of(as);
            }),
            tap((as: any []) => {
                const currentAS = as.find(item => item.Year === year);
                this.selectedAnnualSettlement$.next(currentAS || null);
            })
        );
    }
    onSelectAnnualSettlement(annualSettlement) {
        this.selectedAnnualSettlement$.next(annualSettlement);
    }
}
