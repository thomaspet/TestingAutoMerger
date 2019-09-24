import {Component, Input, Output, EventEmitter, OnInit, ViewChild, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal/interfaces';
import {ToastService, ToastType, ToastTime} from '@uni-framework/uniToast/toastService';
import {CustomerService, StatisticsService} from '@app/services/services';
import PerfectScrollbar from 'perfect-scrollbar';
import {Customer, Distributions} from '../../../unientities';
import * as _ from 'lodash';

@Component({
    selector: 'customer-list-modal',
    templateUrl: './customer-list-modal.html'
})

export class CustomerListModal implements OnInit, IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    customers: Customer[] = [];
    filteredCustomers: Customer[] = [];
    newCustomers: Customer[] = [];
    currentPlan: any;
    type: any;
    busy: boolean = false;
    busySearch: boolean = false;
    initNew: boolean = true;
    scrollbar: PerfectScrollbar;
    newScrollbar: PerfectScrollbar;
    searchControl: FormControl = new FormControl('');
    newCustomerSearchControl: FormControl = new FormControl('');
    newCustomerSearchString: string = '';


    constructor (
        private customerService: CustomerService,
        private statisticsService: StatisticsService,
        private toast: ToastService
    ) {
        this.searchControl.valueChanges
            .debounceTime(150)
            .subscribe(query => {
                this.filteredCustomers = this.filterCustomers(query);
                setTimeout(() => {
                    this.scrollbar.update();
                });
            });
    }

    public ngOnInit() {
        this.currentPlan = this.options.data.plan;
        this.type = this.options.data.type;
        this.getData();
    }

    public getData() {
        this.busy = true;
        const filter = `filter=Distributions.${this.type.keyValue} eq ${this.currentPlan.ID}`;
        this.customerService.GetAll(filter, ['Distributions', 'Info']).subscribe((customers) => {
            this.customers = customers;
            this.filteredCustomers = this.filterCustomers('');
            this.busy = false;

            setTimeout(() => {
                this.scrollbar = new PerfectScrollbar('#customer-scroll');
            });
        }, err => {
            this.toast.addToast('Noe gikk galt', ToastType.warn, ToastTime.medium, 'Kunne ikke laste kundeliste. Prøv igjen.');
        });
    }

    public openNewCustomerSearch() {
        if (this.initNew) {
            this.newScrollbar = new PerfectScrollbar('#new-customer-search');
            this.newCustomerSearchControl.valueChanges
                .debounceTime(500)
                .subscribe(query => {
                    this.getCustomersFromSearch();
                });
        }
        document.getElementById('new-customer-search-input').focus();
        this.initNew = false;
    }

    public filterCustomers(query) {
        const filtered = this.customers.filter((customer: any) => {
            const name = (customer.Info.Name || '').toLowerCase();
            const filterString = (query || '').toLowerCase();

            return name.includes(filterString) || customer.CustomerNumber.toString().includes(filterString);
        });

        return filtered.slice(0, 50);
    }

    public getCustomersFromSearch() {
        this.busySearch = true;
        const filter = `filter=contains(Info.Name, '${this.newCustomerSearchString}') ` +
        `or contains(CustomerNumber, '${this.newCustomerSearchString}')`;

        this.customerService.GetAll(filter, ['Distributions', 'Info']).subscribe((customers) => {
            this.newCustomers = customers;
            this.busySearch = false;
            setTimeout(() => {
                this.newScrollbar.update();
            });
        }, err => this.busySearch = false);
    }

    public customerSelect(customer: Customer, trigger) {
        if (!customer.Distributions) {
            customer.Distributions = new Distributions();
            customer.Distributions._createguid = this.customerService.getNewGuid();
        }

        if (customer.Distributions[this.type.keyValue] === this.currentPlan.ID) {
            this.toast.addToast('Kunde allerede lagt til denne planen', ToastType.warn, ToastTime.medium);
            return;
        }
        this.busySearch = true;
        customer.Distributions[this.type.keyValue] = this.currentPlan.ID;

        this.customerService.Put(customer.ID, customer).subscribe(() => {
            this.toast.addToast('Kunde lagt til plan', ToastType.good, ToastTime.short);
            this.busySearch = false;
            trigger.closeMenu();
            this.getData();
        });

    }

    public removeCustomer(customer: Customer) {
        customer.Distributions[this.type.keyValue] = null;
        this.customerService.Put(customer.ID, customer).subscribe(() => {
            this.toast.addToast('Kunde fjernet fra plan', ToastType.good, ToastTime.short);
            this.getData();
        });
    }

    public close() {
        this.onClose.emit(false);
    }
}
