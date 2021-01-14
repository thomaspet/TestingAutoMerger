import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {tap} from 'rxjs/internal/operators/tap';
import {AccountsSummaryModalComponent} from '@app/components/accounting/annual-settlement/annual-settlement-disposition-including-tax/accounts-summary-modal.component';
import {UniModalService} from '@uni-framework/uni-modal';

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
    summary = [];
    busy = false;
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
        this.busy = true;
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.annualSettlementService.getAnnualSettlementWithReconcile(id).pipe(
                tap(as => this.annualSettlement = as),
                switchMap((as) => this.annualSettlementService.getTaxAndDisposalItems(as))
            ).subscribe((items: any) => {
                this.summary = items;
            }, () => this.busy = false, () => this.busy = false);
        }, () => this.busy = false, () => this.busy = false);
    }
    saveAnnualSettlement(done) {
        this.annualSettlement.Fields.UtbytteBelop = this.summary[2].items.find(it => it.Item === 'Utbytte').Amount;
        this.annualSettlementService.saveAnnualSettlement(this.annualSettlement)
            .subscribe((as) => {
                if (done) {
                    done();
                }
                this.annualSettlement = as;
            });
    }

    openSummaryModal(doneFunction) {
        this.annualSettlement.Fields.UtbytteBelop = this.summary[2].items.find(it => it.Item === 'Utbytte').Amount;
        this.annualSettlementService.saveAnnualSettlement(this.annualSettlement).pipe(
            switchMap(() => this.annualSettlementService.previewAnnualSettlementJournalEntry(this.annualSettlement)),
            switchMap(data => this.modalService.open(AccountsSummaryModalComponent, {data: data}).onClose)
        ).subscribe(result => {
            if (doneFunction) {
                doneFunction();
            }
            if (result === true) {
                this.runTransition(5);
            }
        });
    }

    runTransition(toStep) {
        this.annualSettlementService.transition(this.annualSettlement, 4, toStep)
            .subscribe((as) => {
                this.toast.addToast('Transition 4 to ' + toStep + ' ran', ToastType.good);
                this.router.navigateByUrl('/accounting/annual-settlement');
            });
    }
    onChangeSummaryLine(event) {
        this.recalculateSummary();
    }
    recalculateSummary() {
        const data = this.summary[2].items;
        const dividend = data.find(it => it.Item === 'Utbytte');
        const sum = data.find(it => it.Item === 'Sum disponering');
        const ownCapital = data.find(it => it.Item === 'Overføring annen egenkapital');
        ownCapital.Amount = sum.Amount - dividend.Amount;
        this.summary = [...this.summary];
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
