import {Component, Input} from '@angular/core';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';

declare var moment;

@Component({
    selector: 'amelding-summary-view',
    templateUrl: 'app/components/salary/amelding/ameldingSummary/summary.html',
    directives: [UniTable]
})

export class AmeldingSummaryView {
    @Input() public currentSumUp: any;
    @Input() public currentAMelding: any;
    private employeeTableConfig: UniTableConfig;
    private transactionTableConfig: UniTableConfig;
    private createdDate: string;
    private statusText: string;
    private statuses: any[] = ['Kladd', 'Opprettet', 'Sendt', 'Status fra altinn mottatt'];

    constructor() {        
        this.setupEmployees();
        this.setupTransactions();
    }
    
    public ngOnChanges() {
        if (this.currentSumUp) {
            this.statusText = this.statuses[this.currentSumUp.status];
        }
    }

    public toggleCollapsed(index: number) {
        this.currentSumUp.entities[index].collapsed = !this.currentSumUp.entities[index].collapsed;
    }

    private setupEmployees() {
        let empNoCol = new UniTableColumn('employeeNumber', 'Nr', UniTableColumnType.Number).setWidth('4rem');
        let nameCol = new UniTableColumn('name', 'Navn', UniTableColumnType.Text);
        let emplmntCol = new UniTableColumn('employmentID', 'ID arbeidsforhold', UniTableColumnType.Number);
        let startCol = new UniTableColumn('startDate', 'Startdato', UniTableColumnType.Date);
        let endCol = new UniTableColumn('endDate', 'Sluttdato', UniTableColumnType.Date);

        this.employeeTableConfig = new UniTableConfig(false)
        .setColumns([empNoCol, nameCol, emplmntCol, startCol, endCol]);
    }

    private setupTransactions() {
        let typeCol = new UniTableColumn('incomeType', 'Type', UniTableColumnType.Text);
        let benefitCol = new UniTableColumn('benefit', 'Fordel', UniTableColumnType.Text);
        let descrCol = new UniTableColumn('description', 'Beskrivelse', UniTableColumnType.Text);
        let taxCol = new UniTableColumn('Base_EmploymentTax', 'Trekk', UniTableColumnType.Text);
        taxCol.setTemplate((rowModel) => {
            if (rowModel.Base_EmploymentTax) {
                return 'Ja';
            } else {
                return 'Nei';
            }
        });
        let agaCol = new UniTableColumn('tax', 'Aga', UniTableColumnType.Text);
        agaCol.setTemplate((rowModel) => {
            if (rowModel.tax) {
                return 'Ja';
            } else {
                return 'Nei';
            }
        });
        let amountCol = new UniTableColumn('amount', 'Beløp', UniTableColumnType.Number);

        this.transactionTableConfig = new UniTableConfig(false)
        .setColumns([typeCol, benefitCol, descrCol, taxCol, agaCol, amountCol]);
    }
}
