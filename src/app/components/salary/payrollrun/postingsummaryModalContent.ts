import {Component, Input} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {FieldType} from '../../../../app/unientities';
import {Router} from '@angular/router-deprecated';
import {PayrollrunService} from '../../../../app/services/services';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';

@Component({
    selector: 'postingsummary-modal-content',
    templateUrl: 'app/components/salary/payrollrun/postingsummaryModalContent.html',
    directives: [UniTable]
})
export class PostingsummaryModalContent {
    private busy: boolean;
    private showReceipt: boolean = false;    
    private accountTableConfig: UniTableConfig;    
    @Input() private config: any;    
    private summary: any;    
    private journalNumber: string;
    private journalDate: Date;
    private payDate : Date;
    private headerString : string = 'Konteringssammendrag';
    
    constructor(private routr: Router, private payrollService: PayrollrunService) {
        
    }
    
    public openModal() {
        this.busy = true;        
        this.createTableConfig();

        this.payrollService.getPostingsummary(this.config.payrollrunID)
        .subscribe((response: any) => {
            this.summary = response;            
            this.headerString = 'Konteringssammendrag ' + this.summary.PayrollRun.ID + ' ' + this.summary.PayrollRun.Description + ', utbetales ' + this.formatDate(new Date(this.summary.PayrollRun.PayDate.toString()));
            this.busy = false;
        });
    }
    
    
    public postTransactions() {
        return this.payrollService.postTransactions(this.config.payrollrunID);
    }
    
    public showResponseReceipt(successResponse: any) {
        this.showReceipt = true;
        this.journalNumber = successResponse[0].JournalEntryNumber;
        this.journalDate = successResponse[0].FinancialDate;
    }
    
    
    private getAccountingSum() : number
    {
        var ret : number = 0;
        if (this.summary) {
            this.summary.PostList.forEach((val) => {
                ret += val.Amount;
            } );            
        }
        return ret;
    }

    private createTableConfig() {
        var nameCol = new UniTableColumn('Description', 'Navn', UniTableColumnType.Text);
        var accountCol = new UniTableColumn('Account.AccountNumber', 'Konto', UniTableColumnType.Number);
        var sumCol = new UniTableColumn('Amount', 'Sum', UniTableColumnType.Number);
        this.accountTableConfig = new UniTableConfig(false, false)
            .setColumns( [accountCol, nameCol, sumCol])
            .setColumnMenuVisible(false)            
            .setSearchable(false);
    }

    private formatDate(dt : Date) : string {
        return dt.getDate() + '.' + dt.getMonth() + 1  + '.' + dt.getFullYear();
    }
    
}
