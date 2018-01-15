import {Component, Input, Output, EventEmitter, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import {
    UniModalService
} from '@uni-framework/uniModal/modalService';
import { ErrorService } from '@app/services/common/errorService';
import { UserService, CustomerOrderService, CustomerService } from '@app/services/services';
import { WorkitemTransferWizardFilter } from './transfer-wizard-filter';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { IWizardOptions, WizardSource, MergeByEnum } from './wizardoptions';
import { WorkitemTransferWizardProducts } from './transfer-wizard-products';
import { WorkitemTransferWizardPreview } from './transfer-wizard-preview';
import { InvoiceHourService, ISumHours } from './invoice-hours.service';
import { ConfirmActions, IModalOptions, IUniModal } from '@uni-framework/uniModal/interfaces';

@Component({
    selector: 'workitem-transfer-wizard',
    templateUrl: './transfer-wizard.html',
    providers: [ InvoiceHourService ]
})
export class WorkitemTransferWizard implements IUniModal, OnInit, AfterViewInit {
    @Input() public options: IModalOptions = {};
    @Output() public onClose: EventEmitter<any> = new EventEmitter();
    @ViewChild(WorkitemTransferWizardFilter) private wizardFilter: WorkitemTransferWizardFilter;
    @ViewChild(WorkitemTransferWizardProducts) private wizardProducts: WorkitemTransferWizardProducts;
    @ViewChild(WorkitemTransferWizardPreview) private wizardPreview: WorkitemTransferWizardPreview;

    public workerTypeCombo = '0';

    public step = 0;
    public steps: Array<{label: string}> = [
        { label: 'Utvalg' },
        { label: 'Utvalg' },
        { label: 'Pris/produkt på timeart' },
        { label: 'Forhåndsvisning' },
        { label: 'Overføring' }
    ];
    public workInProgress = false;
    public workIndex = -1;
    public finalOrderList = [];
    public sumHours: ISumHours[];

    public busy: boolean = false;
    public fetching: boolean = false;
    public transferBusy = false;
    public choices: Array<{ type: WizardSource, label: string, checked?: boolean, hours?: number }> = [
        { type: WizardSource.CustomerHours, label: 'Kunde-timer', checked: true, hours: 0},
        { type: WizardSource.OrderHours, label: 'Ordre-timer', hours: 0},
        { type: WizardSource.ProjectHours, label: 'Prosjekt-timer', hours: 0}
    ];

    public wizardOptions: IWizardOptions = {
        currentUser: undefined,
        filterByUserID: 0,
        source: WizardSource.CustomerHours,
        selectedCustomers: [],
        selectedProducts: [],
        orders: [],
        mergeBy: MergeByEnum.mergeByWorktype,
        addComment: true
    };

    constructor(
        private errorService: ErrorService,
        private modalService: UniModalService,
        private userService: UserService,
        private toastService: ToastService,
        private orderService: CustomerOrderService,
        private customerService: CustomerService,
        private invoiceHourService: InvoiceHourService
    ) {
        userService.getCurrentUser().subscribe( user => {
            this.wizardOptions.currentUser = user;
            this.fetchSums();
        });
    }

    public checkOption(choice: { name: string, label: string, checked: boolean }) {
        this.choices.forEach( x => x.checked = false );
        choice.checked = true;
    }

    public ngOnInit() {
    }

    public ngAfterViewInit() {
        setTimeout(function() {
            document.getElementById('good_button_ok').focus();
        });
    }

    public onSourceChanged(event) {
        this.fetchSums();
    }

    private fetchSums() {
        this.wizardOptions.filterByUserID = this.workerTypeCombo === '0' ? this.wizardOptions.currentUser.ID : 0;
        this.wizardOptions.source = this.choices.find( x => x.checked).type;
        if (this.sumHours) {
            this.showSums(this.sumHours);
            return;
        }
        this.fetching = true;
        this.invoiceHourService.getHourTotals(this.wizardOptions)
            .finally( () => this.fetching = false )
            .subscribe( result => {
                this.showSums(result);
            });
    }

    private showSums(result) {
        this.sumHours = result;
        const index = this.wizardOptions.filterByUserID > 0 ? 1 : 0;
        this.choices[0].hours = result[index].customerHours;
        this.choices[1].hours = result[index].orderHours;
        this.choices[2].hours = result[index].projectHours;
    }

    public goBack() {
        if (this.step > 0) {
            this.step--;
        }
    }

    public accept() {
        if (this.step === this.steps.length - 1) {
            this.startTransfer();
            return;
        }

       switch (this.step) {
            case 0:
                this.wizardOptions.filterByUserID = this.workerTypeCombo === '0' ? this.wizardOptions.currentUser.ID : 0;
                this.wizardOptions.source = this.choices.find( x => x.checked).type;
                this.wizardOptions.selectedCustomers.length = 0;
                this.wizardFilter.refresh();
                break;
            case 1:
                const status = this.wizardFilter.canProceed();
                if (status.ok) {
                    this.wizardOptions.selectedCustomers = this.wizardFilter.selectedItems;
                    this.wizardProducts.refresh();
                } else {
                    this.toastService.addToast('Kan ikke gå videre', ToastType.warn, 3, status.msg);
                    return;
                }
            break;
        case 2:
            const prodStatus = this.wizardProducts.canProceed();
            if (prodStatus.ok) {
                setTimeout(() => {
                    this.wizardOptions.selectedProducts = this.wizardProducts.selectedItems;
                    this.wizardPreview.refresh();
                    this.step++;
                }, 20);
            } else {
                this.toastService.addToast('Kan ikke gå videre', ToastType.warn, 3, prodStatus.msg);
            }
            return;
        case 3:
            if (this.wizardPreview.orderList && this.wizardPreview.orderList.length > 0) {
                this.wizardOptions.orders = this.wizardPreview.orderList;
            } else {
                this.toastService.addToast('Ingenting er valgt ut', ToastType.warn, 3, 'Ingenting å overføre');
                return;
            }
            break;
        }

        this.step++;

    }

    public reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }

    private startTransfer() {
        this.workInProgress = true;
        this.transferNext(0, this.wizardOptions);
    }

    private transferNext(index: number, options: IWizardOptions) {

        // Done?
        if (index >= options.orders.length) {
            this.toastService.addToast(`Fullført`, ToastType.good, 5, `${this.finalOrderList.length} ordrer ble opprettet.`);
            this.onClose.emit(ConfirmActions.ACCEPT);
            return;
        }

        this.transferBusy = true;

        const order = options.orders[index];
        this.workIndex = index;

        // Fetch updated customer-details and set to each order:
        this.customerService.Get(order.CustomerID, ['info.InvoiceAddress'])
            .subscribe( customer => {
            if (order && order.CustomerID > 0) {
                // set customer on order (with address etc.)
                if (!order.ID) {
                    order.setCustomer(customer);
                }
                const obs = order.ID ? this.orderService.Put(order.ID, order) : this.orderService.Post(order);
                obs.finally( () => this.transferBusy = false)
                    .subscribe( result => {
                        // add to list of produced orders
                        this.finalOrderList.push(result);
                        setTimeout(() => {
                            // take next
                            this.transferNext(index + 1, options);
                        }, 10);
                    }, err => {
                        this.errorService.handle(err);
                        this.workInProgress = false;
                    }
                );
            }
        });
    }

}
