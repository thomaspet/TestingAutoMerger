import {Component} from '@angular/core';

@Component({
    selector: 'accounting-reports',
    templateUrl: './accountingreports.html'
})
export class AccountingReports {
    public childRoutes: Object[] = [
            { name: 'Resultat', path: '/accounting/accountingreports/result' },
            { name: 'Balanse', path: '/accounting/accountingreports/balance' },
            { name: 'Dimensjoner', path: '/accounting/accountingreports/dimensions' },
            { name: 'Rapporter', path: '/accounting/accountingreports/reports' }/*,
            //KE: Wait with these, need input from BA - but should be easy to implement
            { name: 'Kundereskontro', path: '/accounting/accountingreports/ledgers/customer' },
            { name: 'Leverandørreskontro', path: '/accounting/accountingreports/ledgers/supplier' }*/
        ];

}
