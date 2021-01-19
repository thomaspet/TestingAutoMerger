import {HttpClient} from '@angular/common/http';
import {ChangeDetectionStrategy, ChangeDetectorRef, Component} from '@angular/core';
import * as moment from 'moment';

@Component({
    selector: 'api-status',
    templateUrl: './api-status.html',
    styleUrls: ['./api-status.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ApiStatus {
    hidden: boolean;
    statuses;

    constructor(
        private http: HttpClient,
        private cdr: ChangeDetectorRef,
    ) {}

    ngAfterViewInit() {
        this.http.get<any[]>('/api/status').subscribe(
            res => {
                this.statuses = (res || []).sort((a, b) => a.Type - b.Type).filter(status => {
                    return (!status.FromDate || moment(status.FromDate).isBefore(moment()))
                        && (!status.ToDate || moment(status.ToDate).isAfter(moment()));
                });

                this.cdr.markForCheck();
            },
            err => console.error(err)
        );

        this.cdr.markForCheck();
    }
}
