import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {DashboardDataService} from '../../../dashboard-data.service';
import {AuthService} from '@app/authService';

import * as moment from 'moment';
import {of, forkJoin, Observable} from 'rxjs';
import {catchError, map} from 'rxjs/operators';

@Component({
    selector: 'new-entities-widget',
    templateUrl: './new-entities.html',
    styleUrls: ['./new-entities.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NewEntitiesWidget {
    periodFilters = [
        { label: 'I dag', value: 1 },
        { label: '7 dager', value: 7 },
        { label: '14 dager', value: 14 },
        { label: '30 dager', value: 30 },
    ];

    activeFilter = this.periodFilters[this.periodFilters.length - 1];

    items = [
        {
            model: 'SupplierInvoice',
            label: 'NAVBAR.SUPPLIER_INVOICE',
            count: 0,
            icon: 'receipt_long',
            link: '/accounting/bills',
            hasAccess: true
        },
        {
            model: 'CustomerInvoice',
            label: 'Faktura',
            count: 0,
            icon: 'credit_card',
            link: '/sales/invoices',
            hasAccess: true
        },
        {
            model: 'CustomerOrder',
            label: 'Ordre',
            count: 0,
            icon: 'description',
            link: '/sales/orders',
            hasAccess: true
        },
        {
            model: 'CustomerQuote',
            label: 'Tilbud',
            count: 0,
            icon: 'local_offer',
            link: '/sales/quotes',
            hasAccess: true
        },
        {
            model: 'Customer',
            label: 'Kunder',
            count: 0,
            icon: 'people_outline',
            link: '/sales/customer',
            hasAccess: true
        }
    ];

    constructor(
        private cdr: ChangeDetectorRef,
        private dataService: DashboardDataService,
        private authService: AuthService,
    ) {}

    ngOnInit() {
        this.loadData();
    }

    setActiveFilter(filter) {
        this.activeFilter = filter;
        this.loadData();
    }

    private loadData() {
        const requests: Observable<number>[] = [];
        this.items.forEach(item => {
            if (this.authService.canActivateRoute(this.authService.currentUser, item.link)) {
                const request = this.dataService.get(this.getEndpoint(item.model)).pipe(
                    map(res => res && res[0] && res[0].count),
                    catchError(err => {
                        console.error(err);
                        return of(0);
                    })
                );

                requests.push(request);
            } else {
                item.hasAccess = false;
            }
        });

        forkJoin(requests).subscribe(
            res => {
                this.items = this.items.map((item, index) => {
                    item.count = res[index] || 0;
                    return item;
                });

                this.cdr.markForCheck();
            },
            err => console.error(err)
        );
    }

    private getEndpoint(model: string) {
        const fromDate = moment()
            .subtract(this.activeFilter.value, 'days')
            .startOf('day')
            .format('YYYY-MM-DD');

        return `/api/statistics?model=${model}`
            + `&select=count(ID) as count`
            + `&filter=CreatedAt ge '${fromDate}'`
            + `&wrap=false`;
    }
}
