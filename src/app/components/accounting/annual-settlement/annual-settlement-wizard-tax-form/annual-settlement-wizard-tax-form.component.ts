import {Component} from '@angular/core';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {map, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    selector: 'annual-settlement-wizard-tax-form-component',
    template: `
        <h2>Veiviser til skattemelding/ligningsoppgave</h2>
        <br/>
        <button (click)="runTransition(6)">Run Transition 5 to 6</button>
        <button (click)="runTransition(7)">Run Transition 5 to Complete</button>
    `
})
export class AnnualSettlementWizardTaxFormComponent {
    annualSettlement: any;
    onDestroy$ = new Subject();
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private toast: ToastService,
        private annualSettlementService: AnnualSettlementService
    ) {
    }
    ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.annualSettlementService.getAnnualSettlementWithReconcile(id)
                .subscribe((as: any) => {
                    this.annualSettlement = as;
                });
        });
    }
    runTransition(step) {
        this.annualSettlementService.transition(this.annualSettlement, 5, step)
            .subscribe((as) => {
                this.toast.addToast('Transition 5 to ' + step + ' ran', ToastType.good);
                this.router.navigateByUrl('/accounting/annual-settlement');
            });
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
