import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {UniTable, UniTableColumn, UniTableColumnType, UniTableConfig} from 'unitable-ng2/main';
import {UniForm, UniFormBuilder, UniFieldBuilder} from '../../../../framework/forms';
import {FieldType} from '../../../../app/unientities';
import {Router} from '@angular/router-deprecated';
import {PayrollrunService} from '../../../../app/services/services';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';
import {Observable} from 'rxjs/Observable';
import {Postingsummary} from '../../../models/models';

@Component({
    selector: 'postingsummary-modal-content',
    templateUrl: 'app/components/salary/payrollrun/postingsummaryModalContent.html',
    directives: [UniForm, UniTable]
})
export class PostingsummaryModalContent implements OnInit {
    private postings$ : Observable<any>;
    private busy: boolean;
    private showReceipt: boolean = false;
    private headerConfig: UniFormBuilder = null;
    private accountTableConfig: UniTableConfig;    
    @Input() private config: any;    
    private summary: any;    
    private journalNumber: string;
    private journalDate: Date;
    
    constructor(private routr: Router, private payrollService: PayrollrunService) {
        
    }
    
    public ngOnInit() {
        console.log("ngOnInit");
        this.createTableConfig();

        this.payrollService.getPostingsummary(this.config.payrollrunID)
        .subscribe((response: any) => {
            this.summary = response;            
            this.createHeaderConfig();            
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
    
    private createHeaderConfig() {       
            
            var companyName = this.buildField('Firmanavn', this.summary.SubEntity.BusinessRelationInfo, 'Name', FieldType.TEXT);
            var payrollinfo = this.buildField('Lønnsavregning', this.summary.PayrollRun, 'ID', FieldType.TEXT);
            var orgnumber = this.buildField('Orgnr', this.summary.SubEntity, 'orgnumber', FieldType.TEXT);
            var payDate = this.buildField('Utbetalt', this.summary.PayrollRun, 'PayDate', FieldType.DATEPICKER);
            
            this.headerConfig = new UniFormBuilder();
            this.headerConfig.addUniElements(companyName, payrollinfo, orgnumber, payDate).hideSubmitButton();
            this.headerConfig.readmode();        
    }
    
    private getAccountingSum() : number
    {
        var ret : number = 0;
        if(this.summary)                     {         
            this.summary.PostList.ForEach((val) => {
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
    
    private buildField(label: string, model: any, modelfield: string, type: number, index = null) {
        return new UniFieldBuilder()
            .setLabel(label)
            .setModel(model)
            .setModelField(modelfield)
            .setType(UNI_CONTROL_DIRECTIVES[type]);
    }
}
