import {Component, Input} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {PayrollrunService} from '../../../../app/services/services';

declare var moment;

@Component({
    selector: 'postingsummary-modal-content',
    templateUrl: 'app/components/salary/payrollrun/postingsummaryModalContent.html'
})
export class PostingsummaryModalContent {
    public busy: boolean;
    private showReceipt: boolean = false;    
    private accountTableConfig: UniTableConfig;    
    @Input() private config: any;
    private payrollrunID: number;    
    private summary: any;    
    private journalNumber: string;
    private journalDate: Date;
    private headerString: string = 'Konteringssammendrag';
    
    constructor(
        private payrollService: PayrollrunService, 
        private route: ActivatedRoute
    ) {
        this.route.params.subscribe(params => {
            this.payrollrunID = +params['id'];
        });
    }
    
    public openModal() {
        this.busy = true;        
        this.createTableConfig();

        this.payrollService.getPostingsummary(this.payrollrunID)
        .subscribe((response: any) => {
            this.summary = response;         
            this.headerString = 'Konteringssammendrag: ' + this.summary.PayrollRun.ID + ' - ' + this.summary.PayrollRun.Description + ', utbetales ' + moment(this.summary.PayrollRun.PayDate.toString()).format('DD.MM.YYYY');
            this.busy = false;
        }, error => {
            this.busy = false;
            this.log(error);
        });
    }
    
    
    public postTransactions() {
        return this.payrollService.postTransactions(this.payrollrunID);
    }
    
    public showResponseReceipt(successResponse: any) {
        this.showReceipt = true;
        this.journalNumber = successResponse[0].JournalEntryNumber;
        this.journalDate = moment(successResponse[0].FinancialDate).format('DD.MM.YYYY');
    }
    
    public getAccountingSum(): number {
        var ret: number = 0;
        if (this.summary)                     {         
            this.summary.PostList.forEach((val) => {
                ret += val.Amount;
            } );            
        }
        return ret;
    }

    private createTableConfig() {
        var nameCol = new UniTableColumn('Description', 'Navn', UniTableColumnType.Text);
        var accountCol = new UniTableColumn('Account.AccountNumber', 'Konto', UniTableColumnType.Text);
        var sumCol = new UniTableColumn('Amount', 'Sum', UniTableColumnType.Money);
        this.accountTableConfig = new UniTableConfig(false, false)
            .setColumns( [accountCol, nameCol, sumCol])
            .setColumnMenuVisible(false)            
            .setSearchable(false);
    }

    public log(err) {
        if (err._body) {
            alert(err._body);
        } else {
            alert(JSON.stringify(err));
        }
    }
    
}
