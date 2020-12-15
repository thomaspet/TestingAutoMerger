import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import {BehaviorSubject, Observable, of} from 'rxjs';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {switchMap, tap} from 'rxjs/operators';
import steps from '../annual-settlement-steps/annual-settlement-steps-data';
import {FinancialYearService} from '@app/services/accounting/financialYearService';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {Router} from '@angular/router';

@Component({
    selector: 'annual-settlement-road-map-component',
    templateUrl: './annual-settlement-road-map.component.html',
    styleUrls: ['./annual-settlement-road-map.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AnnualSettlementRoadMapComponent implements OnInit {
    annualSettlements$: Observable<any>;
    selectedAnnualSettlement$ = new BehaviorSubject(null);
    steps = steps;
    constructor(
        private annualSettlementService: AnnualSettlementService,
        private financialYearService: FinancialYearService,
        private toast: ToastService,
        private router: Router
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
                    const currentAS = as.find(it => it.AccountYear === year);
                    if (!currentAS) {
                        return this.annualSettlementService.createFinancialYear(year)
                            .pipe(switchMap(() => this.annualSettlementService.getAnnualSettlements()));
                    }
                }
                return of(as);
            }),
            tap((as: any []) => {
                const currentAS = as.find(item => item.AccountYear === year);
                this.steps = this.addActionsToSteps(this.steps, currentAS);
                this.steps = this.enableDisableSteps(this.steps, currentAS);
                this.steps = this.addIconsToSteps(this.steps, currentAS);
                this.selectedAnnualSettlement$.next(currentAS || null);
            })
        );
    }
    onSelectAnnualSettlement(annualSettlement) {
        this.selectedAnnualSettlement$.next(annualSettlement);
    }
    private enableDisableSteps(_steps, currentAS) {
        return _steps.map((step, index) => {
            switch (index) {
                case 0:
                    step._enabled = currentAS.StatusCode >= 36100;
                    return step;
                case 1:
                    step._enabled = currentAS.StatusCode >= 36105;
                    return step;
                case 2:
                    step._enabled = currentAS.StatusCode >= 36110;
                    return step;
                case 3:
                    step._enabled = currentAS.StatusCode >= 36115;
                    return step;
                case 4:
                    step._enabled = currentAS.StatusCode >= 36120;
                    return step;
                default:
                    step._enabled = currentAS.StatusCode >= 36125;
                    return step;
            }
        });
    }
    private addActionsToSteps(_steps, currentAS) {
        return _steps.map((step, index) => {
            switch (index) {
                case 0:
                    step.action = () => {
                        this.router.navigateByUrl(
                            `/accounting/annual-settlement/${currentAS.ID}/check-list`
                        );
                    };
                    return step;
                case 1:
                    step.action = () => {
                        this.router.navigateByUrl(
                            `/accounting/annual-settlement/${currentAS.ID}/reconcile`
                        );
                    };
                    return step;
                case 2:
                    step.action = () => {
                        this.router.navigateByUrl(
                            `/accounting/annual-settlement/${currentAS.ID}/tax-depreciation-and-differences`
                        );
                    };
                    return step;
                case 3:
                    step.action = () => {
                        this.router.navigateByUrl(
                            `/accounting/annual-settlement/${currentAS.ID}/disposition-including-tax`
                        );
                    };
                    return step;
                case 4:
                    step.action = () => {
                        this.router.navigateByUrl(
                            `/accounting/annual-settlement/${currentAS.ID}/wizzard-tax-form`
                        );
                    };
                    return step;
                case 5:
                    step.action = () => {
                        this.router.navigateByUrl(
                            `/accounting/annual-settlement/${currentAS.ID}/wizzard-annual-accounts`
                        );
                    };
                    return step;
                default:
                    step.action = () => {
                        this.toast.addToast('Lever til Altinn Not implemented yet');
                    };
                    return step;
            }
        });
    }
    private addIconsToSteps(_steps, currentAS) {
        return _steps.map((step, index) => {
            switch (index) {
                case 0:
                    step._icon = currentAS.StatusCode === 36100
                        ? 'edit'
                        : currentAS.StatusCode >= 36105
                            ? 'check_circle'
                            : index + 1;
                    return step;
                case 1:
                    step._icon = currentAS.StatusCode >= 36105 ? 'edit' : index + 1;
                    return step;
                case 2:
                    step._icon = currentAS.StatusCode >= 36110 ? 'edit' : index + 1;
                    return step;
                case 3:
                    step._icon = currentAS.StatusCode >= 36115 ? 'edit' : index + 1;
                    return step;
                case 4:
                    step._icon = currentAS.StatusCode >= 36120 ? 'edit' : index + 1;
                    return step;
                default:
                    step._icon = currentAS.StatusCode >= 36125 ? 'edit' : 'check';
                    return step;
            }
        });
    }
}
