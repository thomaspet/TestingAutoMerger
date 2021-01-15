import {ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {map, switchMap, takeUntil} from 'rxjs/operators';
import {Subject} from 'rxjs';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {infoOption, options} from './checklistoptions';
import {TabService} from '@app/components/layout/navbar/tabstrip/tabService';
import {ToastService, ToastTime, ToastType} from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'annual-settlement-check-list-component',
    templateUrl: './annual-settlement-check-list.component.html',
    styleUrls: ['./annual-settlement-check-list.component.sass'],
    encapsulation: ViewEncapsulation.None
})
export class AnnualSettlementCheckListComponent {
    onDestroy$ = new Subject();
    options = options;
    infoOption = infoOption;
    check = false;
    showInfoBox = true;
    showMvaBox = true;
    annualSettlement;
    nextOption = 0;
    areAllOptionsChecked = false;
    busy = false;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private annualSettlementService: AnnualSettlementService,
        private tabService: TabService,
        private toast: ToastService,
        private changeDetector: ChangeDetectorRef) {}
    ngOnInit() {
        this.busy = true;
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.annualSettlementService.getAnnualSettlement(id).pipe(
                switchMap(as => this.annualSettlementService.getAnnualSettlementWithCheckList(as)),
            ).subscribe(as => {
                this.annualSettlement = as;
                this.initOptions();
                this.areAllOptionsChecked = this.checkIfAreAllOptionsChecked();
                this.busy = false;
            }, (err) => {
                this.toast.addToast('Error lagring', ToastType.warn, ToastTime.medium, err.message);
                this.busy = false;
            }, () => this.busy = false);
        });
    }

    completeCheckListStep(done) {
        this.annualSettlementService.moveFromStep1ToStep2(this.annualSettlement).subscribe(result => {
            this.router.navigateByUrl('/accounting/annual-settlement');
        }, (err) => {
            console.log(err);
            const message = err && err.error && err.error.Messages && err.error.Messages.length > 0 && err.error.Messages[0].Message;
            this.toast.addToast('Error in Transition', ToastType.warn, ToastTime.medium, err.message + ' - ' + message);
        }, () => {
            if (done) {
                done();
            }
        });
    }

    saveAnnualSettlement(done) {
        this.busy = true;
        this.annualSettlementService.saveAnnualSettlement(this.annualSettlement)
            .subscribe((as) => {
                this.annualSettlement = as;
                this.busy = false;
            }, (err) => {
                this.toast.addToast('Error lagring', ToastType.warn, ToastTime.medium, err.message);
                this.busy = false;
            }, () => {
                if (done) {
                    done();
                }
                this.busy = false;
            });
    }

    initOptions() {
        this.options = this.options.map((op: any) => {
            op.checked = this.annualSettlement.AnnualSettlementCheckList[op.property];
            return op;
        });
        this.setNextOption(this.options);
        this.areAllOptionsChecked = this.checkIfAreAllOptionsChecked();
        this.changeDetector.detectChanges();
    }

    updateOption(option, value) {
        if (option.property) {
            option.checked = value.checked;
            this.annualSettlement.AnnualSettlementCheckList[option.property] = value.checked;
        }
        this.setNextOption(this.options);
        this.areAllOptionsChecked = this.checkIfAreAllOptionsChecked();
        this.changeDetector.detectChanges();
    }

    setNextOption(_options) {
        let stopLooking = false;
        _options.forEach((op: any, index: number) => {
            if (!op.checked && !stopLooking) {
                stopLooking = true;
                this.nextOption = index;
            }
        });
        if (stopLooking === false) {
            this.nextOption = _options.length;
        }
    }

    checkIfAreAllOptionsChecked() {
        return this.options.reduce((result: boolean, option: any) => {
            if (result === true) {
                return option.checked ? true : false;
            }
            return false;
        }, true);
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
