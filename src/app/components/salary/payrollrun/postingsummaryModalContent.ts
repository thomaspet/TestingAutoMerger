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
    // private receiptConfig: UniFormBuilder;
    @Input() private config: any;
    private postingsummary: Postingsummary;
    // private receiptModel: {text: string, documentnumber: number, postingDate: Date};
    
    constructor(private routr: Router, private payrollService: PayrollrunService) {
        
    }
    
    public ngOnInit() {
        this.getData()
        .subscribe((response: Postingsummary) => {
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
        
        this.busy = false;
    }
    
    public postTransactions() {
        console.log('see how invoice has used this. return observable');
        return this.payrollService.postTransactions(this.config.payrollrunID);
    }
    
    public showResponseReceipt() {
        console.log('remove unitable and show uniform with receipt');
        this.showReceipt = true;
    }
    
    private createHeaderConfig() {
        var companyName = this.buildField('Firmanavn', this.postingsummary.SubEntity.BusinessRelationInfo, 'Name', FieldType.TEXT);
        
        
        this.headerConfig = new UniFormBuilder();
        this.headerConfig.addUniElements(companyName).hideSubmitButton();
        this.headerConfig.readmode();
    }
    
    private buildField(label: string, model: any, modelfield: string, type: number, index = null) {
        return new UniFieldBuilder()
            .setLabel(label)
            .setModel(model)
            .setModelField(modelfield)
            .setType(UNI_CONTROL_DIRECTIVES[type]);
    }
}
