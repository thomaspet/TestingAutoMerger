import {Component} from '@angular/core';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {map, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    selector: 'annual-settlement-disposition-including-tax-component',
    template: `
        <h2>DISPONERING INKL SKATTEBEREGNING</h2>
        <br/>
        <button (click)="runTransition(5)">Step 4 to Step 5</button>
        <button (click)="runTransition(6)">Step 4 to Step 6</button>
    `
})
export class AnnualSettlementDispositionIncludingTaxComponent {
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
    runTransition(toStep) {
        this.annualSettlementService.transition(this.annualSettlement, 4, toStep)
            .subscribe((as) => {
                this.toast.addToast('Transition 4 to ' + toStep + ' ran', ToastType.good);
                this.router.navigateByUrl('/accounting/annual-settlement');
            });
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
