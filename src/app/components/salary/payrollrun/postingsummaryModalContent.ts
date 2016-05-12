import {Component, Input, OnInit} from '@angular/core';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/unitable';
import {UniForm, UniFormBuilder, UniFieldBuilder} from '../../../../framework/forms';
import {PayrollRun, FieldType} from '../../../../app/unientities';
import {Router} from '@angular/router-deprecated';
import {PayrollrunService} from '../../../../app/services/services';
import {UNI_CONTROL_DIRECTIVES} from '../../../../framework/controls';
import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'postingsummary-modal-content',
    templateUrl: 'app/components/salary/payrollrun/postingsummarymodalcontent.html',
    directives: [UniForm, UniTable]
})
export class PostingsummaryModalContent implements OnInit {
    
    private busy: boolean;
    private headerConfig: UniFormBuilder = null;
    @Input() private config: any;
    private payrollrun: PayrollRun;
    private model: {};
    
    constructor(private routr: Router, private payrollService: PayrollrunService) {
        
    }
    
    public ngOnInit() {
        this.getData()
        .subscribe((response) => {
            this.setData(response);
        }, (err) => {
            console.log(err);
        });
    }
    
    public getData() {
        this.busy = true;
        return Observable.forkJoin(
            this.payrollService.Get(this.config.payrollrunID)
        );
    }
    
    public setData(response: any) {
        let [payroll] = response;
        this.payrollrun = payroll;
        
        this.createHeaderConfig();
        
        this.busy = false;
    }
    
    private createHeaderConfig() {
        var companyName = this.buildField('Firmanavn', this.model, 'companyname', FieldType.TEXT);
        
        
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
