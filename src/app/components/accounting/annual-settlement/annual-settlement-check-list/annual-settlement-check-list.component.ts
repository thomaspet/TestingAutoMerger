import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {catchError, map, switchMap, takeUntil, tap} from 'rxjs/operators';
import {forkJoin, Subject, throwError} from 'rxjs';
import {AnnualSettlementService} from '@app/components/accounting/annual-settlement/annual-settlement.service';
import {options, mvaOption, infoOption} from './checklistoptions';
@Component({
    selector: 'annual-settlement-check-list-component',
    templateUrl: './annual-settlement-check-list.component.html'
})
export class AnnualSettlementCheckListComponent {
    onDestroy$ = new Subject();
    options = options;
    infoOption = infoOption;
    mvaOption = mvaOption;
    check = false;
    checkList: any;
    showInfoBox = true;
    showMvaBox = true;
    constructor(private route: ActivatedRoute, private service: AnnualSettlementService) {}
    ngOnInit() {
        this.route.params.pipe(
            takeUntil(this.onDestroy$),
            map((params) => params.id)
        ).subscribe(id => {
            this.service.getAnnualSettlement(id).pipe(
                switchMap(as => this.service.checkList(as)),
                catchError(error => {
                    console.log(error);
                    return throwError(error);
                })
            ).subscribe(checkList => {
                this.checkList = checkList;
                console.log(checkList);
            });
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next();
        this.onDestroy$.complete();
    }
}
