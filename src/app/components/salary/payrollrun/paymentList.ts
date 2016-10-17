import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {PayrollrunService} from '../../../services/services';
import {TabService, UniModules} from '../../layout/navbar/tabstrip/tabService';
import {UniTable, UniTableConfig, UniTableColumnType, UniTableColumn} from 'unitable-ng2/main';
import {SalaryTransactionPay, SalaryTransactionPayLine} from '../../../unientities';

@Component({
    selector: 'payrollrun-paymentlist',
    templateUrl: 'app/components/salary/payrollrun/paymentList.html'
})

export class PaymentList implements OnInit {

    private payrollRunID: number;
    private paymentList: SalaryTransactionPay[];
    private payLines: SalaryTransactionPayLine[];
    private empSum: number = 0;
    private sum: number = 0;
    private payDate: Date = null;
    private account: string = '';
    private busy: boolean = false;

    private paymentListConfig: UniTableConfig;
    // private withholding: UniTableBuilder;
    private withholdingConfig: UniTableConfig;

    constructor(private _route: ActivatedRoute, private _payrollrunService: PayrollrunService, private _tabService: TabService) {

    }

    public ngOnInit() {
        this.busy = true;
        this._route.params.subscribe(params => {


            this.payrollRunID = +params['id'];

            //Dummy moduleID, going to be removed!
            this._tabService.addTab({ name: 'Utbetalingsliste #' + this.payrollRunID, url: 'salary/paymentlist/' + this.payrollRunID, moduleID: UniModules.PaymentList, active: true });
            this._payrollrunService.getPaymentList(this.payrollRunID).subscribe((response) => {
                this.paymentList = [response];
                this.payLines = this.paymentList[0].PayList;
                this.paymentList[0].PayList.forEach((payLine) => {
                    this.empSum += payLine.NetPayment;
                });
                this.sum = this.empSum + this.paymentList[0].Withholding;
                this.payDate = new Date(this.paymentList[0].PaymentDate.toString());
                this.account = this.paymentList[0].CompanyAccount;
                this.buildTableConfigs();
                this.busy = false;
            });

        });

    }

    public buildTableConfigs() {

        let accountCol = new UniTableColumn('Account', 'Til konto', UniTableColumnType.Text);
        let nameCol = new UniTableColumn('EmployeeName', 'Navn', UniTableColumnType.Text);
        let addressCol = new UniTableColumn('Address', 'Adresse', UniTableColumnType.Text);
        let postalCodeCol = new UniTableColumn('PostalCode', 'Postnr', UniTableColumnType.Text).setWidth('10%');
        let cityCol = new UniTableColumn('City', 'Poststed', UniTableColumnType.Text);
        let paymentCol = new UniTableColumn('NetPayment', 'Beløp', UniTableColumnType.Money);

        this.paymentListConfig = new UniTableConfig(false, false)
            .setColumns([
                accountCol, nameCol, addressCol, postalCodeCol, cityCol, paymentCol
            ]);

        let witholdingCol = new UniTableColumn('Withholding', 'Beløp', UniTableColumnType.Money);
        let companyNameCol = new UniTableColumn('CompanyName', 'Navn', UniTableColumnType.Text);
        let companyAddressCol = new UniTableColumn('CompanyAddress', 'Adresse', UniTableColumnType.Text);
        let companyPostalCodeCol = new UniTableColumn('CompanyPostalCode', 'Postnr', UniTableColumnType.Text).setWidth('10%');
        let companyCityCol = new UniTableColumn('CompanyCity', 'Poststed', UniTableColumnType.Text);

        this.withholdingConfig = new UniTableConfig(false, false)
            .setColumns([companyNameCol, companyAddressCol, companyPostalCodeCol, companyCityCol, witholdingCol]);

        /*this.withholding = new UniTableBuilder(this.paymentList, false)
            .setFilterable(false)
            .setPageable(false)
            .setColumnMenuVisible(false)
            .setSearchable(false)
            .addColumns(companyNameCol, companyAddressCol, companyPostalCodeCol, companyCityCol, witholdingCol);
            */
    }

}
