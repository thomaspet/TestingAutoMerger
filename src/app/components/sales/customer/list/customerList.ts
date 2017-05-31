import {Component, ViewChild, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {UniHttp} from '../../../../../framework/core/http/http';
import {Customer, LocalDate, CompanySettings} from '../../../../unientities';
import {URLSearchParams} from '@angular/http';
import {TabService, UniModules} from '../../../layout/navbar/tabstrip/tabService';
import {ToastService, ToastType} from '../../../../../framework/uniToast/toastService';
import {ITickerActionOverride, TickerAction, ITickerColumnOverride} from '../../../../services/common/uniTickerService';
import {
    CustomerService,
    ErrorService,
    CompanySettingsService
} from '../../../../services/services';

@Component({
    selector: 'customer-list',
    templateUrl: './customerList.html'
})
export class CustomerList implements OnInit {

    private actionOverrides: Array<ITickerActionOverride> = [

    ];

    private companySettings: CompanySettings;

    private columnOverrides: Array<ITickerColumnOverride> = [ ];

    private tickercode: string = 'customer_list';


    constructor(
        private uniHttpService: UniHttp,
        private router: Router,
        private customerService: CustomerService,
        private tabService: TabService,
        private toastService: ToastService,
        private errorService: ErrorService,
        private companySettingsService: CompanySettingsService,
    ) { }

    public ngOnInit() {
        this.companySettingsService.Get(1)
            .subscribe(settings => {
                this.companySettings = settings;
                }, err => this.errorService.handle(err)
            );

        this.tabService.addTab({
            url: '/sales/customer',
            name: 'Kunde',
            active: true,
            moduleID: UniModules.Customers
        });
    }

    public createCustomer() {
        this.router.navigateByUrl('/sales/customer/0');
    }







}
