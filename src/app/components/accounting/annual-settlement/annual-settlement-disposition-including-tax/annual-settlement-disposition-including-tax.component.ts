import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';

@Component({
    selector: 'annual-settlement-disposition-including-tax-component',
    templateUrl: './annual-settlement-disposition-including-tax.component.html',
    styleUrls: ['./annual-settlement-disposition-including-tax.component.sass'],
    encapsulation: ViewEncapsulation.None
})
export class AnnualSettlementDispositionIncludingTaxComponent {
    annualSettlement: any;
    onDestroy$ = new Subject();
    infoData = {
        title: 'Skatteberegning og disponering av resultat',
        text: 'Her er det virkelig lorum ipsum'
    };
    initialCustomStatus = {
        label: '',
        class: '',
        icon: 'info',
        outlined: false
    };
    customStatus;
    showInfoBox = true;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
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
                    this.customStatus = null;
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
    onCloseInfoAlert() {
        this.customStatus = Object.assign({}, this.initialCustomStatus);
        this.showInfoBox = false;
        this.cd.markForCheck();
    }
    onClickInfoIcon() {
        this.showInfoBox = true;
        this.cd.markForCheck();
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
