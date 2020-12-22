import {ChangeDetectorRef, Component, EventEmitter, Input, Output} from '@angular/core';
import {IUniSaveAction} from '@uni-framework/save/save';
import {IToolbarConfig} from '@app/components/common/toolbar/toolbar';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {fromEvent, Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Component({
    selector: 'annual-settlement-disposition-including-tax-toolbar-component',
    template: `
        <uni-toolbar
            [config]="toolbarconfig"
            [saveactions]="saveActions"
            [showFullStatustrack]="false"
            [customStatus]="customStatus"
        ></uni-toolbar>
    `
})
export class AnnualSettlementDispositionIncludingTaxToolbarComponent {
    @Input() annualSettlement;
    @Input() initialCustomStatus;
    @Output() clickInfoIcon = new EventEmitter<void>(true);
    onDestroy$ = new Subject();
    saveActions: IUniSaveAction[] = [];
    toolbarconfig: IToolbarConfig = {
        title: 'Skatteberegning og disponering av resultat',
        hideBreadcrumbs: false,
        omitFinalCrumb: false
    };
    customStatus = this.initialCustomStatus;
    eventSubscription;
    constructor(
        private service: AnnualSettlementService,
        private cd: ChangeDetectorRef
    ) {
        this.saveActions.push(<IUniSaveAction> {
            action: (done) => {
                this.service
                    .Put(this.annualSettlement.ID, this.annualSettlement)
                    .subscribe(done);
            },
            label: 'Lagre',
            main: true,
            disabled: false,
        });
    }
    ngOnChanges() {
        if (this.initialCustomStatus) {
            this.customStatus = this.initialCustomStatus;
        }
        if (this.eventSubscription) {
            return;
        }
        setTimeout(() => {
            const root = document.getElementsByTagName('annual-settlement-disposition-including-tax-toolbar-component');
            let target = null;
            if (root?.length === 1) {
                const icon = root[0].getElementsByClassName('material-icons');
                if (icon?.length === 1) {
                    target = icon;
                }
            }
            if (!target) {
                return;
            }
            this.eventSubscription = fromEvent(target, 'click')
                .pipe(takeUntil(this.onDestroy$))
                .subscribe(event =>  {
                    this.eventSubscription.unsubscribe();
                    this.eventSubscription = null;
                    this.customStatus = null;
                    this.clickInfoIcon.emit();
                });
        }, 200);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
