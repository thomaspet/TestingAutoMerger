import {Component, OnInit} from 'angular2/core';
import {RouteParams} from 'angular2/router';
import {PayrollrunService} from '../../../services/services';
// import {FieldType} from '../../../unientities';
import {UniTable, UniTableBuilder, UniTableColumn} from '../../../../framework/uniTable';
// import {UniForm} from '../../../../framework/forms';
import {TabService} from '../../layout/navbar/tabstrip/tabService';

@Component({
    selector: 'payrollrun-paymentlist',
    templateUrl: 'app/components/salary/payrollrun/paymentList.html',
    directives: [UniTable],
    providers: [PayrollrunService]
})

export class PaymentList implements OnInit {
    
    private payrollRunID: number;
    private paymentList: any[] = [];
    private empSum: number = 0;
    private sum: number = 0;
    private payDate: Date = null;
    private account: string = '';
    private busy: boolean = false;
    
    private paymentListEmp: UniTableBuilder;
    private withholding: UniTableBuilder;
    
    constructor(private _routeParams: RouteParams, private _payrollrunService: PayrollrunService, private _tabService: TabService) {
        this.payrollRunID = +_routeParams.get('id');
    }
    
    public ngOnInit() {
        this.busy = true;
        this._payrollrunService.getPaymentList(this.payrollRunID).subscribe((response) => {
            this.paymentList.push(response);
            this.paymentList[0].PayList.forEach((payLine) => {
                this.empSum += payLine.NetPayment;
            });
            this.sum = this.empSum + this.paymentList[0].Withholding;
            this.payDate = new Date(this.paymentList[0].PaymentDate);
            this.account = this.paymentList[0].CompanyAccount;
            this.buildTableConfigs();
            this.busy = false;
        });
        this._tabService.addTab({name: 'Utbetalingsliste #' + this.payrollRunID, url: 'salary/paymentlist/' + this.payrollRunID});
    }
    
    public buildTableConfigs() {
        
        var accountCol = new UniTableColumn('Account', 'Til konto', 'string');
        var nameCol = new UniTableColumn('EmployeeName', 'Navn', 'string');
        var addressCol = new UniTableColumn('Address', 'Adresse', 'string');
        var postalCodeCol = new UniTableColumn('PostalCode', 'Postnr', 'string').setWidth('10%');
        var cityCol = new UniTableColumn('City', 'Poststed', 'string');
        var paymentCol = new UniTableColumn('NetPayment', 'Beløp', 'number');
        
        this.paymentListEmp = new UniTableBuilder(this.paymentList[0].PayList, false)
            .setFilterable(false)
            .setPageable(false)
            .setColumnMenuVisible(false)
            .setSearchable(false)
            .addColumns(accountCol, nameCol, addressCol, postalCodeCol, cityCol, paymentCol);
        
        var witholdingCol = new UniTableColumn('Withholding', 'Beløp', 'number');
        var companyNameCol = new UniTableColumn('CompanyName', 'Navn', 'string');
        var companyAddressCol = new UniTableColumn('CompanyAddress', 'Adresse', 'string');
        var companyPostalCodeCol = new UniTableColumn('CompanyPostalCode', 'Postnr', 'string').setWidth('10%');
        var companyCityCol = new UniTableColumn('CompanyCity', 'Poststed', 'string');
        
        this.withholding = new UniTableBuilder(this.paymentList, false)
            .setFilterable(false)
            .setPageable(false)
            .setColumnMenuVisible(false)
            .setSearchable(false)
            .addColumns(companyNameCol, companyAddressCol, companyPostalCodeCol, companyCityCol, witholdingCol);
            
    }
    
    
}
