import {Component} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {catchError, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {Subject, throwError} from 'rxjs';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {options, infoOption} from './checklistoptions';
import {TabService, UniModules} from '@app/components/layout/navbar/tabstrip/tabService';
@Component({
    selector: 'annual-settlement-check-list-component',
    templateUrl: './annual-settlement-check-list.component.html'
})
export class AnnualSettlementCheckListComponent {
    onDestroy$ = new Subject();
    options = options;
    infoOption = infoOption;
    check = false;
    checkList: any;
    showInfoBox = true;
    showMvaBox = true;
    annualSettlement;
    nextOption = 0;
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private annualSettlementService: AnnualSettlementService,
        private tabService: TabService) {}
    ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.addTab(id);
            this.annualSettlementService.getAnnualSettlement(id).pipe(
                tap(as => this.annualSettlement = as),
                switchMap(as => this.annualSettlementService.checkList(as)),
                catchError(error => {
                    console.log(error);
                    return throwError(error);
                })
            ).subscribe(checkList => {
                this.checkList = checkList;
                this.initOptions();
            });
        });
    }
    private addTab(id: number) {
        this.tabService.addTab({
            name: 'Årsavslutning Check List', url: `/accounting/annual-settlement/${id}/check-list`,
            moduleID: UniModules.Accountsettings, active: true
        });
    }
    completeCheckListStep() {
        this.annualSettlementService.moveFromStep1ToStep2(this.annualSettlement).subscribe(result => {
            this.router.navigateByUrl('accounting/annualsettlement');
        });
    }

    initOptions() {
        this.options = this.options.map((op: any) => {
            if (this.checkList[op.property]) {
                op.checked = this.checkList[op.property];
            }
            return op;
        });
        this.setNextOption(this.options);
    }

    updateOption(option, value) {
        if (option.property) {
            option.checked = value.checked;
            this.checkList[option.property] = value.checked;
            this.annualSettlement.AnnualSettlementCheckList[option.property] = value.checked;
        }
        this.setNextOption(this.options);
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

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
