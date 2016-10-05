import {Component} from '@angular/core';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'payments',
    templateUrl: 'app/components/accounting/journalentry/payments/payments.html'
})
export class Payments {
    constructor(private tabService: TabService) {
        this.tabService.addTab({ name: 'Betalinger', url: '/accounting/journalentry/payments', moduleID: UniModules.Accounting, active: true });
    }
}
