import { Component, OnInit, OnDestroy } from '@angular/core';
import { UniView } from '@uni-framework/core/uniView';
import { Router, ActivatedRoute } from '@angular/router';
import { UniCacheService } from '@app/services/services';
import { Subject, BehaviorSubject } from 'rxjs';
import { SalaryBalance, SalBalType } from '@uni-entities';
import { tap, switchMap, map, takeUntil } from 'rxjs/operators';
const SAVING_KEY = 'viewSaving';
const SALARY_BALANCE_KEY = 'salarybalance';

@Component({
  selector: 'uni-salary-balance-details-container',
  templateUrl: './salary-balance-details-container.component.html',
  styleUrls: ['./salary-balance-details-container.component.sass']
})
export class SalaryBalanceDetailsContainerComponent extends UniView implements OnInit, OnDestroy {
    destroy$: Subject<any> = new Subject();
    salaryBalance: SalaryBalance;
    busy$: BehaviorSubject<boolean> = new BehaviorSubject(false);
    constructor(
        private router: Router,
        protected cacheService: UniCacheService,
        private route: ActivatedRoute,
    ) {
        super(router.url, cacheService);
    }

    ngOnInit(): void {
        this.route
            .parent
            .params
            .pipe(
                tap(() => {
                    super.updateCacheKey(this.router.url);
                    super.getStateSubject(SAVING_KEY)
                        .pipe(
                            takeUntil(this.destroy$),
                        )
                        .subscribe(isSaving => this.busy$.next(isSaving));
                }),
                switchMap(() => super.getStateSubject(SALARY_BALANCE_KEY)),
                takeUntil(this.destroy$),
            )
            .subscribe(balance => this.salaryBalance = {...balance});
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onSalaryBalanceChange(salaryBalance: SalaryBalance) {
        super.updateState(SALARY_BALANCE_KEY, salaryBalance, true);
    }

}
