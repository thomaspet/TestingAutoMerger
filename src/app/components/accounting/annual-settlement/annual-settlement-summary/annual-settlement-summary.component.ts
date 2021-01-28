import {ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {Subject} from 'rxjs';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';
import {UniModalService} from '@uni-framework/uni-modal';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {tap} from 'rxjs/internal/operators/tap';
import {of} from 'rxjs/observable/of';
import {AuthService} from '@app/authService';

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
    busy = false;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private cd: ChangeDetectorRef,
        private toast: ToastService,
        private modalService: UniModalService,
        private authService: AuthService,
        private annualSettlementService: AnnualSettlementService
    ) {
    }
    ngOnInit() {
        this.busy = true;
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.annualSettlementService.getAnnualSettlementWithReconcile(id).pipe(
                tap(as => this.annualSettlement = as),
                switchMap((as) => this.annualSettlementService.getAnnualSettlementSummary(as))
            ).subscribe((items: any) => {
                this.summary = items;
                this.busy = false;
            }, (err) => {
                this.toast.addToast('Error lagring', ToastType.warn, ToastTime.medium, err.message);
                this.busy = false;
            }, () => this.busy = false);
        }, (err) => {
            this.toast.addToast('Error lagring', ToastType.warn, ToastTime.medium, err.message);
            this.busy = false;
        }, () => this.busy = false);
    }
    completeSummary(done) {
        const data = {
            UtfyllerNaringsoppgave: 'Foretak',
            KontaktpersonNavn: this.authService.currentUser.DisplayName,
            KontaktpersonEPost: this.authService.currentUser.Email
        };
        this.annualSettlementService.openContactModal(this.annualSettlement, data).pipe(
            switchMap((as) => {
                if (!as) {
                    return of(null);
                }
                return this.annualSettlementService.saveAnnualSettlement(this.annualSettlement).pipe(
                    switchMap(() => this.annualSettlementService.moveFromStep5ToStep6(this.annualSettlement))
                );
            })
        ).subscribe((as) => {
            if (!as) {
                return;
            }
            this.annualSettlementService.openGoToAltinnModal().onClose.subscribe(result => {
                if (result === true) {
                    window.open('https://altinn.no', '_blank');
                }
                if (done) {
                    done();
                }
            });
        }, (errorResponse) => {
            if (done) {
                done();
            }
            this.toast.addToast(errorResponse.error.Message);
        }, () => {
            if (done) {
                done();
            }
        });
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
