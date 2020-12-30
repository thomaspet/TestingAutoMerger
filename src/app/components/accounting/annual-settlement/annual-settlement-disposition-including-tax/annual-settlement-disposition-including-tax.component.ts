import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {ActivatedRoute, Router} from '@angular/router';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {tap} from 'rxjs/internal/operators/tap';
import {UniSummaryModal} from '@app/components/accounting/annual-settlement/annual-settlement-disposition-including-tax/summary-modal.component';
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
                switchMap((as) => this.annualSettlementService.getTaxAndDisposalItems(as))
            ).subscribe((items: any) => {
                this.summary = items;
            });
        });
    }
    saveAnnualSettlement(done) {
        this.annualSettlementService
            .Put(this.annualSettlement.ID, this.annualSettlement)
            .subscribe((as) => {
                if (done) {
                    done();
                }
                this.annualSettlement = as;
            });
    }

    openSummaryModal(doneFunction) {
        this.annualSettlementService.previewAnnualSettlementJournalEntry(this.annualSettlement).pipe(
            switchMap(data => this.modalService.open(UniSummaryModal, {data: data}).onClose)
        ).subscribe(result => {
            doneFunction();
            if (result === true) {
                this.runTransition(6);
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
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
