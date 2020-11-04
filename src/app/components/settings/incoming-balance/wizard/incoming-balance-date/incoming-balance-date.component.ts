import { Component, OnInit } from '@angular/core';
import { LocalDate } from '@uni-entities';
import { FieldType, UniFieldLayout } from '@uni-framework/ui/uniform';
import { BehaviorSubject, Subject } from 'rxjs';
import { switchMap, take, takeUntil } from 'rxjs/operators';
import { IncomingBalanceLogicService } from '../../shared/services/incoming-balance-logic.service';
import { IncomingBalanceStoreService } from '../../services/incoming-balance-store.service';
import { UniTranslationService } from '@app/services/services';

@Component({
    selector: 'uni-incoming-balance-date',
    templateUrl: './incoming-balance-date.component.html',
    styleUrls: ['./incoming-balance-date.component.sass']
})
export class IncomingBalanceDateComponent implements OnInit {

    config$: BehaviorSubject<any> = new BehaviorSubject({showLabelAbove: true, autoFocus: true});
    model$: BehaviorSubject<{date: LocalDate}> = new BehaviorSubject({date: new LocalDate});
    fields$: BehaviorSubject<UniFieldLayout[]> = new BehaviorSubject([]);
    private destroy$: Subject<any> = new Subject();

    constructor(
        public stateService: IncomingBalanceStoreService,
        private logicService: IncomingBalanceLogicService,
        private translationServie: UniTranslationService,
    ) { }

    ngOnInit(): void {
        this.stateService
            .date$
            .pipe(
                take(1),
            )
            .subscribe(date => this.model$.next({date: date}));
        this.logicService.reportRoute('date');
        this.stateService
            .isBooked$
            .pipe(
                takeUntil(this.destroy$),
            )
            .subscribe(isBooked => this.fields$.next(this.getFields(isBooked)));
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    onFormChange() {
        this.model$
            .pipe(
                take(1),
            )
            .subscribe(model => this.stateService.setDate(model.date));
    }

    private getFields(isBooked?: boolean) {
        return [
            <UniFieldLayout>{
                Property: 'date',
                Label: this.translationServie
                    .translate(`SETTINGS.INCOMING_BALANCE.DATE.DATE_LABEL~${this.translationServie.translate('COMMON.APPLICATION_NAME')}`),
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Classes: 'incoming-balance-date',
                ReadOnly: isBooked,
            }
        ]
    }

}
