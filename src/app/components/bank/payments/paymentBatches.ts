import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {StatisticsService} from '../../../services/services';
import {Bank, BankAccount, Payment, PaymentCode} from '../../../unientities';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {IToolbarConfig} from '../../common/toolbar/toolbar';

declare const moment;

@Component({
    selector: 'payment-batches',
    templateUrl: 'app/components/bank/payments/paymentBatches.html',
})
export class PaymentBatches {

    private toolbarconfig: IToolbarConfig;

    constructor(private router: Router,
                private statisticsService: StatisticsService,
                private tabService: TabService) {

        this.tabService.addTab({ name: 'Betalingsbunter', url: '/bank/batches', moduleID: UniModules.PaymentBatches, active: true });
    }

    public ngOnInit() {
        this.toolbarconfig = {
                title: 'Betalingsbunter',
                subheads: [],
                navigation: {}
            };
    }
}
