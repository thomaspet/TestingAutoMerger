import {Component, ViewChild} from '@angular/core';
import {Router} from '@angular/router';
import {AccountService, JournalEntryService, StatisticsService} from '../../../../services/services';
import {Account, FieldType} from '../../../../unientities';
import {Observable} from 'rxjs/Observable';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {AccountDetailsReportModal} from '../detailsmodal/accountDetailsReportModal';
import {PeriodFilter, PeriodFilterHelper} from '../periodFilter/periodFilter';
import {IToolbarConfig} from '../../../common/toolbar/toolbar';

declare const moment;

@Component({
    selector: 'accounting-balance-report',
    templateUrl: './balancereport.html',
})
export class BalanceReport {
    @ViewChild(AccountDetailsReportModal) private accountDetailsReportModal: AccountDetailsReportModal;
    private periodFilter1: PeriodFilter;
    private periodFilter2: PeriodFilter;

    private toolbarconfig: IToolbarConfig = {
        title: 'Balanse'
    };

    constructor(private router: Router,
                private statisticsService: StatisticsService,
                private tabService: TabService) {

        this.tabService.addTab({ name: 'Balanse - oversikt', url: '/accounting/accountingreports/balance', moduleID: UniModules.AccountingReports, active: true });
    }

    public ngOnInit() {
        // get default period filters
        this.periodFilter1 = PeriodFilterHelper.getFilter(1, null);
        this.periodFilter2 = PeriodFilterHelper.getFilter(2, this.periodFilter1);
    }

    private onPeriodFilter1Changed(event) {
        this.periodFilter1 = event;
        PeriodFilterHelper.saveFilterSettings(1, this.periodFilter1);
    }

    private onPeriodFilter2Changed(event) {
        this.periodFilter2 = event;
        PeriodFilterHelper.saveFilterSettings(2, this.periodFilter2);
    }
}
