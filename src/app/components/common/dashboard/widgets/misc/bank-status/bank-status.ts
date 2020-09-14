import {Component, ChangeDetectionStrategy, ChangeDetectorRef} from '@angular/core';
import {Router} from '@angular/router';
import {DashboardDataService} from '../../../dashboard-data.service';
import {catchError, map} from 'rxjs/operators';
import {of, forkJoin} from 'rxjs';

@Component({
    selector: 'bank-status',
    templateUrl: './bank-status.html',
    styleUrls: ['./bank-status.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class BankStatusWidget {
    items;
    lastAvtaleGiroBatch;

    constructor(
        private dataService: DashboardDataService,
        private cdr: ChangeDetectorRef,
        private router: Router,
    ) {}

    ngOnInit() {
        forkJoin([
            this.getPaymentList(),
            this.getPaidNoMatch(),
            this.getPayedNotJournaled(),
            this.getCustomersWithAvtalegiro(),
            this.getLastAvtalegiroBatch()
        ]).subscribe(res => {
            this.items = [
                {
                    label: 'Betalingsliste',
                    count: res[0],
                    route: '/bank/ticker?code=payment_list',
                },
                {
                    label: 'Innbetalt uten match',
                    count: res[1],
                    route: '/bank/ticker?code=bank_list&filter=incomming_without_match',
                },
                {
                    label: 'Utbetalinger som krever behandling',
                    count: res[2],
                    route: '/bank/ticker?code=payment_list&filter=payed_not_journaled',
                },
                {
                    label: 'Kunder med avtalegiro',
                    count: res[3],
                    router: '/bank/ticker?code=avtalegiro_list'
                }
            ];

            this.lastAvtaleGiroBatch = res[4];
            this.cdr.markForCheck();
        });
    }

    navigate(route) {
        if (route) {
            this.router.navigateByUrl(route);
        }
    }

    private getCount(endpoint: string) {
        return this.dataService.get(endpoint + '&wrap=false').pipe(
            map(res => res && res[0] && res[0].Count),
            catchError(err => {
                console.error(err);
                return of('-');
            })
        );
    }

    private getPaymentList() {
        const filter = [
            `Payment.IsCustomerPayment eq 'false'`,
            `Payment.StatusCode eq '44001'`,
            `Payment.isPaymentClaim eq 'false'`,
            `Payment.isPaymentCancellationRequest eq 'false'`
        ].join(' and ');

        const endpoint = `/api/statistics?model=Payment&select=count(ID) as Count&filter=${filter}`;
        return this.getCount(endpoint);
    }

    private getPaidNoMatch() {
        const endpoint = `/api/statistics?model=Payment`
            + `&select=count(Payment.ID) as Count`
            + `&filter=Payment.IsCustomerPayment eq 'true' and Payment.StatusCode eq '44018'`;

        return this.getCount(endpoint);
    }

    private getPayedNotJournaled() {
        const filter = [
            `Payment.IsCustomerPayment eq 'false'`,
            `Payment.StatusCode eq '44018'`,
            `Payment.isPaymentClaim eq 'false'`,
            `Payment.isPaymentCancellationRequest eq 'false'`
        ].join(' and ');

        const endpoint = `/api/statistics?model=Payment&select=count(ID) as Count&filter=${filter}`;
        return this.getCount(endpoint);
    }

    private getCustomersWithAvtalegiro() {
        const endpoint = `/api/statistics?model=Customer&select=count(ID) as Count&filter=AvtaleGiro eq 'true'`;
        return this.getCount(endpoint);
    }

    private getLastAvtalegiroBatch() {
        const select = [
            'ID as ID',
            'PaymentBatch.TotalAmount as TotalAmount',
            'PaymentBatch.CreatedAt as CreatedAt',
            'PaymentBatch.NumberOfPayments as NumberOfPayments'
        ].join(',');

        const endpoint = `/api/statistics?model=PaymentBatch&top=1&wrap=false`
            + `&select=${select}`
            + `&filter=PaymentBatchTypeID eq 3`
            + `&orderby=ID desc`;

        return this.dataService.get(endpoint).pipe(
            map(res => res && res[0]),
            catchError(err => {
                console.error(err);
                return of(null);
            })
        );
    }
}

