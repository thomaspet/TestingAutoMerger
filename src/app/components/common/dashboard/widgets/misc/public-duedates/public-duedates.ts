import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {catchError, map} from 'rxjs/operators';
import {of, Subscription} from 'rxjs';
import {DashboardDataService} from '../../../dashboard-data.service';
import {FinancialDeadline} from '@uni-entities';

import PerfectScrollbar from 'perfect-scrollbar';
import * as moment from 'moment';

@Component({
    selector: 'public-duedates-widget',
    templateUrl: './public-duedates.html',
    styleUrls: ['./public-duedates.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PublicDueDatesWidget {
    dataSubscription: Subscription;
    scrollbar: PerfectScrollbar;
    dueDates: FinancialDeadline[];

    numberOfDaysOptions = [30, 60, 90];
    numberOfDays = 60;

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService,
    ) {}

    ngOnInit() {
        this.loadPublicDueDates();
        this.dataSubscription?.unsubscribe();
    }

    ngOnDestroy() {
        this.scrollbar?.destroy();
    }

    updateNumberOfDays(numberOfDays) {
        this.numberOfDays = numberOfDays;
        this.loadPublicDueDates();
    }

    private loadPublicDueDates() {
        this.dataSubscription = this.dataService.get(
            `/api/biz/deadlines?action=number-of-days-filtered&nrOfDays=${this.numberOfDays}`
        ).pipe(
            catchError(err => {
                console.error(err);
                return of([]);
            }),
            map((duedates: FinancialDeadline[]) => {
                return duedates
                    .sort((a, b) => moment(a.Deadline).isAfter(moment(b.Deadline)) ? 1 : -1)
                    .map(dueDate => {
                        const text = dueDate.AdditionalInfo.replace('Frist for ', '');
                        dueDate['_text'] = text.charAt(0).toUpperCase() + text.slice(1);

                        const daysRemaining = moment(dueDate.Deadline).diff(moment(), 'days');
                        let cssClass;
                        let daysLabel;

                        if (daysRemaining < 7) {
                            cssClass = daysRemaining <= 1 ? 'bad' : 'warn';
                            if (daysRemaining <= 0) {
                                daysLabel = 'I dag';
                            } else {
                                daysLabel = daysRemaining + (daysRemaining === 1 ? ' dag' : ' dager');
                            }
                        } else {
                            daysLabel = moment(dueDate.Deadline).format('DD. MMM');
                        }

                        dueDate['_class'] = cssClass;
                        dueDate['_daysLabel'] = daysLabel;
                        return dueDate;
                    });
            })
        ).subscribe(dueDates => {
            this.dueDates = dueDates;
            this.cdr.markForCheck();
            setTimeout(() => {
                this.scrollbar = new PerfectScrollbar('#duedate-content', {
                    wheelPropagation: false,
                    wheelSpeed: .5
                });
            });
        });
    }

    seeAll() {
        window.open('https://www.skatteetaten.no/bedrift-og-organisasjon/starte-og-drive/frister-gebyrer-og-tilleggsskatt/frister-og-oppgaver/', '_blank');
    }
}
