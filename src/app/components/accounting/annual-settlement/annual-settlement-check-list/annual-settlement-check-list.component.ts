import {ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {Subject, throwError} from 'rxjs';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {infoOption, options} from './checklistoptions';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';

@Component({
    selector: 'annual-settlement-check-list-component',
    templateUrl: './annual-settlement-check-list.component.html',
    styleUrls: ['./annual-settlement-check-list.component.sass'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush
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
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private annualSettlementService: AnnualSettlementService,
        private tabService: TabService,
        private changeDetector: ChangeDetectorRef) {}
    ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.annualSettlementService.getAnnualSettlement(id).pipe(
                switchMap(as => this.annualSettlementService.getAnnualSettlementWithCheckList(as)),
                catchError(error => {
                    return throwError(error);
                })
            ).subscribe(as => {
                this.annualSettlement = as;
                this.initOptions();
                this.areAllOptionsChecked = this.checkIfAreAllOptionsChecked();
            });
        });
    }

    completeCheckListStep(done) {
        this.annualSettlementService.moveFromStep1ToStep2(this.annualSettlement).subscribe(result => {
            if (done) {
                done();
            }
            this.router.navigateByUrl('/accounting/annual-settlement');
        });
    }

    saveAnnualSettlement(done) {
        this.annualSettlementService.saveAnnualSettlement(this.annualSettlement)
            .subscribe((as) => {
                if (done) {
                    done();
                }
                this.annualSettlement = as;
            });
    }

    initOptions() {
        this.options = this.options.map((op: any) => {
            if (this.annualSettlement.AnnualSettlementCheckList[op.property]) {
                op.checked = this.annualSettlement.AnnualSettlementCheckList[op.property];
            }
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
