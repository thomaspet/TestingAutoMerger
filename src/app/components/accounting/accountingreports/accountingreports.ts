import {Component} from '@angular/core';

@Component({
    selector: 'accounting-reports',
    templateUrl: './accountingreports.html'
})
export class AccountingReports {
    private childRoutes = [
            { name: 'Resultat', path: '/accounting/accountingreports/result' },
            { name: 'Balanse', path: '/accounting/accountingreports/balance' }/*,
            //KE: Wait with these, need input from BA - but should be easy to implement
            { name: 'Kundereskontro', path: '/accounting/accountingreports/ledgers/customer' },
            { name: 'Leverandørreskontro', path: '/accounting/accountingreports/ledgers/supplier' }*/
        ];

}
