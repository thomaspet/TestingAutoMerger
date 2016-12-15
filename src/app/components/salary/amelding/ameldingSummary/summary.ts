import {Component, Input} from '@angular/core';
import {UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';

declare var moment;

@Component({
    selector: 'amelding-summary-view',
    templateUrl: 'app/components/salary/amelding/ameldingSummary/summary.html'
})

export class AmeldingSummaryView {
    @Input() public currentSumUp: any;
    @Input() public currentAMelding: any;
    private employeeTableConfig: UniTableConfig;
    private transactionTableConfig: UniTableConfig;
    private createdDate: string = '';
    private sentDate: string = '';
    private statusText: string;
    private statuses: any[] = ['Generert', 'Generert', 'Innsendt', 'Status mottatt fra altinn'];

    constructor() {
        this.setupEmployees();
        this.setupTransactions();
    }

    public ngOnChanges() {
        if (this.currentSumUp) {
            if (this.currentSumUp.status === null) {
                this.currentSumUp.status = 0;
            }
            if (this.currentSumUp.status === 3) {
                this.statusText = this.currentSumUp._sumupStatusText;
            } else {
                this.statusText = this.statuses[this.currentSumUp.status];
            }
        }
        if (this.currentAMelding) {
            this.createdDate = moment(this.currentAMelding.created).format('DD.MM.YYYY HH:mm');
            if (this.currentAMelding.sent) {
                this.sentDate = moment(this.currentAMelding.sent).format('DD.MM.YYYY HH:mm');
            }
        }
    }

    private setupEmployees() {
        let empNoCol = new UniTableColumn('employeeNumber', 'Nr', UniTableColumnType.Number).setWidth('4rem');
        let nameCol = new UniTableColumn('name', 'Navn', UniTableColumnType.Text);
        let emplmntCol = new UniTableColumn('employmentID', 'ID arbeidsforhold', UniTableColumnType.Number).setWidth('10rem');
        let startCol = new UniTableColumn('startDate', 'Startdato', UniTableColumnType.LocalDate).setWidth('8rem');
        let endCol = new UniTableColumn('endDate', 'Sluttdato', UniTableColumnType.LocalDate).setWidth('8rem');

        this.employeeTableConfig = new UniTableConfig(false, true, 30)
        .setColumns([empNoCol, nameCol, emplmntCol, startCol, endCol]);
    }

    private setupTransactions() {
        let typeCol = new UniTableColumn('incomeType', 'Type', UniTableColumnType.Text);
        let benefitCol = new UniTableColumn('benefit', 'Fordel', UniTableColumnType.Text);
        let descrCol = new UniTableColumn('description', 'Beskrivelse', UniTableColumnType.Text);
        let taxCol = new UniTableColumn('Base_EmploymentTax', 'Trekk', UniTableColumnType.Text).setWidth('4rem');
        taxCol.setTemplate((rowModel) => {
            if (rowModel.Base_EmploymentTax) {
                return 'Ja';
            } else {
                return 'Nei';
            }
        });
        let agaCol = new UniTableColumn('tax', 'Aga', UniTableColumnType.Text).setWidth('4rem');
        agaCol.setTemplate((rowModel) => {
            if (rowModel.tax) {
                return 'Ja';
            } else {
                return 'Nei';
            }
        });
        let amountCol = new UniTableColumn('amount', 'Beløp', UniTableColumnType.Money)
        .setWidth('6rem')
        .setCls('column-align-right');

        this.transactionTableConfig = new UniTableConfig(false, true, 30)
        .setColumns([typeCol, benefitCol, descrCol, taxCol, agaCol, amountCol]);
    }
}
