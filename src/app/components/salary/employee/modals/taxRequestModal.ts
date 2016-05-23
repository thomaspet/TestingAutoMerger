import {Component, Type, ViewChild, Input, AfterViewInit} from '@angular/core';
import {Router} from '@angular/router-deprecated';
import {UniModal} from '../../../../../framework/modals/modal';
import {UniForm, UniFormBuilder, UniFieldBuilder} from '../../../../../framework/forms';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../../framework/unitable';
import {UNI_CONTROL_DIRECTIVES} from '../../../../../framework/controls';
import {FieldType, PayrollRun, SalaryTransaction} from '../../../../../app/unientities';
import {SalaryTransactionService, PayrollrunService, EmployeeService} from '../../../../../app/services/services';
import {Observable} from 'rxjs/Observable';
import {RootRouteParamsService} from '../../../../services/rootRouteParams';
@Component({
    selector: 'tax-request-modal-content',
    directives: [],
    providers: [],
    templateUrl: 'app/components/salary/employee/modals/'
})
export class TaxRequestModalContent {
    
}

@Component({
    selector: 'tax-request-modal',
    directives: [UniModal],
    template: `
        <button type="button" (click)="openModal()">Send forespørsel om skattekort</button>
        <uni-modal [type]="type" [config]="modalConfig"></uni-modal>
    `
})
export class TaxRequestModal {
    public type: TaxRequestModalContent;
    public config: any = {};
    @ViewChild(UniModal)
    private modal: UniModal;
    
    private employeeID: number;
    
    constructor(private rootRouteParams: RootRouteParamsService) {
        this.employeeID = +rootRouteParams.params.get('id');
        
        this.config = {
            title: '',
            hasCancelButton: true,
            cancel: () => {
                this.modal.close();
            }
        };
    }
}
