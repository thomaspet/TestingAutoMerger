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
    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private service: AnnualSettlementService,
        private tabService: TabService) {}
    ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.addTab(id);
            this.service.getAnnualSettlement(id).pipe(
                tap(as => this.annualSettlement = as),
                switchMap(as => this.service.checkList(as)),
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
        this.service.Transition(this.annualSettlement.ID, this.annualSettlement, '1-to-step-2' )
            .subscribe(result => {
                this.router.navigateByUrl('accounting/annual-settlement');
            });
    }

    initOptions() {
        this.options = this.options.map((op: any) => {
            if (this.checkList[op.property]) {
                op.checked = this.checkList[op.property];
            }
            return op;
        });
    }

    updateOption(option, value) {
        if (option.property) {
            option.checked = value.checked;
            this.checkList[option.property] = value.checked;
            this.annualSettlement.AnnualSettlementCheckList[option.property] = value.checked;
        }
    }
    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
