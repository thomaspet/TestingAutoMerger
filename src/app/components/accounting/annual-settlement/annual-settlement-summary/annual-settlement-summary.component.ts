import {ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService} from '@uni-framework/uniToast/toastService';
import {ConfirmActions, UniModalService} from '@uni-framework/uni-modal';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {tap} from 'rxjs/internal/operators/tap';

@Component({
    selector: 'annual-settlement-summary-component',
    templateUrl: './annual-settlement-summary.component.html',
    styleUrls: ['./annual-settlement-summary.component.sass'],
    encapsulation: ViewEncapsulation.None
})
export class AnnualSettlementSummaryComponent {
    annualSettlement: any;
    onDestroy$ = new Subject();
    infoData = {
        title: 'Årsoppgave - oppsummering før innsending',
        text: 'Her får du en oppsummering av tallene som vil sendes til Altinn. Det er viktig at du logger deg inn i Altinn og kontrollerer at Skattemeldingen RF-1028 med tilhørende underskjemaer er korrekt. Du kan gjøre justeringer direkte i Altinn dersom du har behov for det. '
    };
    summary = [];
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private toast: ToastService,
        private modalService: UniModalService,
        private annualSettlementService: AnnualSettlementService
    ) {
    }
    ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.annualSettlementService.getAnnualSettlementWithReconcile(id).pipe(
                tap(as => this.annualSettlement = as),
                switchMap((as) => this.annualSettlementService.getAnnualSettlementSummary(as))
            ).subscribe((items: any) => {
                this.summary = items;
            });
        });
    }
    completeCheckListStep() {
        this.annualSettlementService.openGoToAltinnModal().onClose.subscribe(result => {
            if (result === true) {
                this.annualSettlementService.moveFromStep5ToStep6(this.annualSettlement).subscribe(result2 => {
                    console.log(result2);
                    this.toast.addToast(JSON.stringify(result2));
                });
                // this.router.navigateByUrl(''); // GO TO ALTINN
            }
        });
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
