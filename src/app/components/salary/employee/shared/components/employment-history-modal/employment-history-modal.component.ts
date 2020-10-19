import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { UniTranslationService } from '@app/services/services';
import { EmploymentHistoryRecord } from '@uni-entities';
import { UniTableColumn, UniTableColumnType, UniTableConfig } from '@uni-framework/ui/unitable';
import { IModalOptions, IUniModal } from '@uni-framework/uni-modal/interfaces';
import { EmploymentHistoryService } from '@app/components/salary/employee/shared/services/employment-history.service';

@Component({
    selector: 'uni-employment-history-modal',
    templateUrl: './employment-history-modal.component.html',
    styleUrls: ['./employment-history-modal.component.sass']
})
export class EmploymentHistoryModalComponent implements OnInit, OnDestroy, IUniModal {
    onClose: EventEmitter<any> = new EventEmitter<any>();
    options?: IModalOptions;
    config: UniTableConfig;

    constructor(
        public employmentHistoryService: EmploymentHistoryService,
        private translationService: UniTranslationService,
    ) { }

    ngOnInit(): void {
        this.setConfig();
        this.employmentHistoryService.fetchHistory(this.options.data);
    }

    ngOnDestroy(): void {
        this.employmentHistoryService.clearHistory();
    }

    setConfig() {
        const changedAtCol = new UniTableColumn(
            'ChangedAt',
            this.translationService.translate('SALARY.EMPLOYMENT_HISTORY_MODAL.CHANGED_AT_LABEL'),
            UniTableColumnType.DateTime
        );
        const stepCol = new UniTableColumn(
            'RegulativeStepNr',
            this.translationService.translate('SALARY.EMPLOYMENT_HISTORY_MODAL.STEP_LABEL'),
            UniTableColumnType.Number,
        );
        const percentCol = new UniTableColumn(
            'WorkPercent',
            this.translationService.translate('SALARY.EMPLOYMENT_HISTORY_MODAL.WORK_PERCENT_LABEL'),
            UniTableColumnType.Percent
        );
        const hourRateCol = new UniTableColumn(
            'HourRate',
            this.translationService.translate('SALARY.EMPLOYMENT_HISTORY_MODAL.HOUR_RATE_LABEL'),
            UniTableColumnType.Money
        );
        const monthRateCol = new UniTableColumn(
            'MonthRate',
            this.translationService.translate('SALARY.EMPLOYMENT_HISTORY_MODAL.MONTH_RATE_LABEL'),
            UniTableColumnType.Money
        );
        const yearRateCol = new UniTableColumn(
            'MonthRate',
            this.translationService.translate('SALARY.EMPLOYMENT_HISTORY_MODAL.YEAR_RATE_LABEL'),
            UniTableColumnType.Money
        )
        .setTemplate((row: EmploymentHistoryRecord) => {
            if (!row.MonthRate) {
                return '';
            }
            return `${row.MonthRate * 12}`;
        });
        this.config = new UniTableConfig('salary.employee.employment.history', false)
            .setColumns(
                [
                    changedAtCol,
                    stepCol,
                    percentCol,
                    hourRateCol,
                    monthRateCol,
                    yearRateCol,
                ]
            );
    }

}
