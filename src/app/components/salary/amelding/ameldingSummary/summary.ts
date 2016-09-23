import {Component, Input, Output, EventEmitter} from '@angular/core';
import {AmeldingSumUp, AmeldingData} from '../../../../unientities';
import {AMeldingService} from '../../../../services/Salary/AMelding/AmeldingService';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {AsyncPipe} from '@angular/common';

declare var moment;

@Component({
    selector: 'amelding-summary-view',
    templateUrl: 'app/components/salary/amelding/ameldingSummary/summary.html',
    directives: [UniTable],
    providers: [AMeldingService],
    pipes: [AsyncPipe]
})

export class AmeldingSummaryView {
    private currentSumUp: any; // AmeldingSumUp;
    @Input() public currentAMelding: AmeldingData;
    private employeeTableConfig: UniTableConfig;
    private transactionTableConfig: UniTableConfig;
    private createdDate: string;
    private totalAga: number;
    private totalForskuddstrekk: number;
    private statusText: string;
    private outputObj: any = {};
    @Output() private updateTotals: EventEmitter<any> = new EventEmitter<any>(true);

    private statuses: any[] = ['Kladd', 'Opprettet', 'Sendt', 'Status fra altinn mottatt'];

    constructor(private _ameldService: AMeldingService) {
        
    }
    
    public ngOnChanges() {
        if (this.currentAMelding !== undefined) {
            this.createdDate = moment(this.currentAMelding.created).format('DD.MM.YYYY HH:mm');
            this._ameldService.getAmeldingSumUp(this.currentAMelding.ID)
            .subscribe(sumup => {
                this.setSumUp(sumup);
                this.setupEmployees();
                this.setupTransactions();
            });
        } else {
            this.currentSumUp = {};
        }
    }

    public toggleCollapsed(index: number) {
        this.currentSumUp.entities[index].collapsed = !this.currentSumUp.entities[index].collapsed;
    }

    private setSumUp(sumup: AmeldingSumUp) {
        this.currentSumUp = sumup;
        this.totalAga = 0;
        this.totalForskuddstrekk = 0;

        this.statusText = this.statuses[this.currentSumUp.status];
        
        if (this.currentSumUp.entities) {
            this.currentSumUp.entities.forEach(virksomhet => {
                virksomhet.collapsed = true;
                this.totalAga += virksomhet.sums.aga;
            });
        }
        
        this.outputObj.legalEntityNo = this.currentSumUp.LegalEntityNo;
        this.outputObj.totalAga = this.totalAga;
        this.outputObj.totalForskuddstrekk = this.totalForskuddstrekk;
        
        this.updateTotals.emit(this.outputObj);
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
        let agaCol = new UniTableColumn('tax', 'Aga', UniTableColumnType.Text);
        let amountCol = new UniTableColumn('amount', 'Beløp', UniTableColumnType.Number);

        this.transactionTableConfig = new UniTableConfig(false)
        .setColumns([typeCol, benefitCol, descrCol, taxCol, agaCol, amountCol]);
    }
}
