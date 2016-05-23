import {Component, Input, OnInit} from '@angular/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/unitable';
import {UniForm, UniFormBuilder, UniFieldBuilder} from '../../../../framework/forms';
import {FieldType} from '../../../../app/unientities';
import {Router} from '@angular/router-deprecated';
import {PayrollrunService} from '../../../../app/services/services';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';
import {Observable} from 'rxjs/Observable';
import {Postingsummary} from '../../../models/models';

@Component({
    selector: 'postingsummary-modal-content',
    templateUrl: 'app/components/salary/payrollrun/postingsummarymodalcontent.html',
    directives: [UniForm, UniTable]
})
export class PostingsummaryModalContent implements OnInit {
    
    private busy: boolean;
    private showReceipt: boolean = false;
    private headerConfig: UniFormBuilder = null;
    private accountTableConfig: any;
    private debcredTableConfig: any;
    @Input() private config: any;
    private postingsummary: Postingsummary;
    private journalNumber: string;
    private journalDate: Date;
    
    constructor(private routr: Router, private payrollService: PayrollrunService) {
        
    }
    
    public ngOnInit() {
        this.getData()
        .subscribe((response: Postingsummary) => {
            console.log('response from getdata', response);
            this.setData(response);
        }, (err) => {
            console.log(err);
        });
    }
    
    public getData() {
        this.busy = true;
        return Observable.forkJoin(
            this.payrollService.getPostingsummary(this.config.payrollrunID)
        );
    }
    
    public setData(response: any) {
        let [postsum] = response;
        this.postingsummary = postsum;
        
        this.createHeaderConfig();
        this.createTableConfig();
        
        this.busy = false;
    }
    
    public postTransactions() {
        return this.payrollService.postTransactions(this.config.payrollrunID);
    }
    
    public showResponseReceipt(successResponse: any) {
        this.showReceipt = true;
        console.log('successResponse', successResponse);
        this.journalNumber = successResponse[0].ID;
        this.journalNumber = successResponse[0].RegisteredDate;
    }
    
    private createHeaderConfig() {
        if (this.postingsummary) {
            var companyName = this.buildField('Firmanavn', this.postingsummary.SubEntity.BusinessRelationInfo, 'Name', FieldType.TEXT);
            var payrollinfo = this.buildField('Lønnsavregning', this.postingsummary.PayrollRun, 'ID', FieldType.TEXT);
            var orgnumber = this.buildField('Orgnr', this.postingsummary.SubEntity, 'orgnumber', FieldType.TEXT);
            var payDate = this.buildField('Utbetalt', this.postingsummary.PayrollRun, 'PayDate', FieldType.DATEPICKER);
            
            this.headerConfig = new UniFormBuilder();
            this.headerConfig.addUniElements(companyName, payrollinfo, orgnumber, payDate).hideSubmitButton();
            this.headerConfig.readmode();
        }
    }
    
    private createTableConfig() {
        var nameCol = new UniTableColumn('Name', 'Navn', 'string');
        var accountCol = new UniTableColumn('Account', 'Konto', 'number');
        var sumCol = new UniTableColumn('Sum', 'Sum', 'number');
        this.accountTableConfig = new UniTableBuilder(this.postingsummary.PostList, false)
            .addColumns(accountCol, nameCol, sumCol)
            .setColumnMenuVisible(false)
            .setPageable(false)
            .setSearchable(false);
        
        var debCol = new UniTableColumn('Debet', 'Debit', 'number');
        var credCol = new UniTableColumn('Credit', 'Kredit', 'number');
        var debcred: any[] = new Array();
        var dc: {} = {Debet: this.postingsummary.Debet, Credit: this.postingsummary.Credit};
        debcred.push(dc);
        console.log('debcred array', debcred);
        this.debcredTableConfig = new UniTableBuilder(debcred, false)
            .setColumnMenuVisible(false)
            .addColumns(debCol, credCol)
            .setPageable(false)
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
