import {Component, Input, Output, EventEmitter, ViewChild, OnInit, AfterViewInit} from '@angular/core';
import {
    IUniModal,
    IModalOptions,
    ConfirmActions,
    UniModalService
} from '@uni-framework/uniModal/modalService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ErrorService } from '@app/services/common/errorService';
import { UserService, CustomerOrderService, CustomerService } from '@app/services/services';
import { WorkitemTransferWizardFilter } from './transfer-wizard-filter';
import { ToastService, ToastType, ToastTime } from '@uni-framework/uniToast/toastService';
import { IWizardOptions, WizardSource } from './wizardoptions';
import { WorkitemTransferWizardProducts } from './transfer-wizard-products';
import { WorkitemTransferWizardPreview } from '@app/components/timetracking/invoice-hours/transfer-wizard-preview';

@Component({
    selector: 'workitem-transfer-wizard',
    templateUrl: './transfer-wizard.html',
    styles: [
        `.container { padding: 1em 1em 0 1em; }
         .wizard-step-container { height: 15em; overflow-y: auto; }
         .stepheader { padding-bottom: 0.5em; font-weight: bold; font-size: 12pt; }
        `
    ]
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

    public busy: boolean = false;
    public transferBusy = false;
    public choices: Array<{ type: WizardSource, label: string, checked?: boolean }> = [
        { type: WizardSource.CustomerHours, label: 'Kunde-timer', checked: true},
        { type: WizardSource.OrderHours, label: 'Ordre-timer'},
        { type: WizardSource.ProjectHours, label: 'Prosjekt-timer'}
    ];

    public wizardOptions: IWizardOptions = {
        currentUserID: 0,
        currentUser: undefined,
        filterByUserID: 0,
        source: WizardSource.CustomerHours,
        selectedCustomers: [],
        selectedProducts: [],
        orders: []
    };

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private userService: UserService,
        private toastService: ToastService,
        private orderService: CustomerOrderService,
        private customerService: CustomerService
    ) {
        userService.getCurrentUser().subscribe( user => {
            this.wizardOptions.currentUserID = user.ID;
            this.wizardOptions.currentUser = user;
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
                this.wizardOptions.filterByUserID = this.workerTypeCombo === '0' ? this.wizardOptions.currentUserID : 0;
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
            if (this.wizardProducts.selectedItems && this.wizardProducts.selectedItems.length > 0) {
                setTimeout(() => {
                    this.wizardOptions.selectedProducts = this.wizardProducts.selectedItems;
                    this.wizardPreview.refresh();
                    this.step++;
                }, 20);
            } else {
                this.toastService.addToast('Ingenting er valgt ut', ToastType.warn, 3, 'Du må velge hva som skal overføres.');
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
