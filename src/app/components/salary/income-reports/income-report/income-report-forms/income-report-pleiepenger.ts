import { Input } from '@angular/core';
import { Component } from '@angular/core';
import { IncomeReportData } from '@uni-entities';
import { IPeriod } from '@uni-framework/interfaces/interfaces';
import { IncomeReportStore } from '../../income-reports.store';
import { FravaerPeriode } from '../../shared/shared-services/incomeReportHelperService';

@Component({
    selector: 'income-report-pleiepenger',
    templateUrl: './income-report-pleiepenger.html'
})

export class IncomeReportPleiepenger {
    @Input() incomereport: IncomeReportData;
    @Input() readOnly: boolean;

    constructor(private incomeReportStore: IncomeReportStore) { }

    onPeriodsChange(periods: IPeriod[]) {
        this.incomereport['Report'].Skjemainnhold.pleiepengerPerioder = periods;
        this.incomeReportStore.updateStore(this.incomereport);
    }
}
