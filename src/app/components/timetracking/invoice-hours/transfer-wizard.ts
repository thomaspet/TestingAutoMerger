import {Component, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {
    IUniModal,
    IModalOptions,
    ConfirmActions,
    UniModalService
} from '@uni-framework/uniModal/modalService';
import { StatisticsService } from '@app/services/common/statisticsService';
import { ErrorService } from '@app/services/common/errorService';
import { OnInit, AfterViewInit } from '@angular/core/src/metadata/lifecycle_hooks';
import { UserService } from '@app/services/services';
import { WorkitemTransferWizardFilter } from '@app/components/timetracking/invoice-hours/transfer-wizard-filter';
import { ToastService, ToastType } from '@uni-framework/uniToast/toastService';

@Component({
    selector: 'workitem-transfer-wizard',
    templateUrl: './transfer-wizard.html',
    styles: [
        `.container { padding: 1em 1em 0 1em; }
         .wizard-step-container { height: 15em; overflow-y: auto; }
         .stepheader { padding-bottom: 0.5em; font-weight: bold; }
        `
    ]
})
export class WorkitemTransferWizard implements IUniModal, OnInit, AfterViewInit {
    @Input() public options: IModalOptions = {};
    @Output() public onClose: EventEmitter<any> = new EventEmitter();
    @ViewChild(WorkitemTransferWizardFilter) private wizardFilter: WorkitemTransferWizardFilter;

    public workerTypeCombo = 0;

    public step = 0;
    public steps: Array<{label: string}> = [
        { label: 'Utvalg' },
        { label: 'Utvalg' },
        { label: 'Produkt/pris' },
        { label: 'Fullfør' }
    ];

    public busy: boolean = false;
    public choices: Array<{ name: string, label: string, checked?: boolean }> = [
        { name: 'CustomerHours', label: 'Kunde-timer', checked: true},
        { name: 'OrderHours', label: 'Ordre-timer'},
        { name: 'ProjectHours', label: 'Prosjekt-timer'}
    ];

    public filterOptions = {
        UserID: 0,
        selectedUserID: 0,
        sourceType: 'CustomerHours',
        selectedCustomers: []
    };

    constructor(
        private statisticsService: StatisticsService,
        private errorService: ErrorService,
        private modalService: UniModalService,
        private userService: UserService,
        private toastService: ToastService
    ) {
        userService.getCurrentUser().subscribe( user => {
            this.filterOptions.UserID = user.ID;
        });
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
            this.onClose.emit(ConfirmActions.ACCEPT);
            return;
        }

       switch (this.step) {
            case 0:
                this.filterOptions.selectedUserID = this.workerTypeCombo === 0 ? this.filterOptions.UserID : 0;
                this.wizardFilter.refresh();
                break;
            case 1:
                if (this.wizardFilter.selectedItems && this.wizardFilter.selectedItems.length > 0) {
                    this.filterOptions.selectedCustomers = this.wizardFilter.selectedItems;
                } else {
                    this.toastService.addToast('Ingenting er valgt ut', ToastType.warn, 3, 'Du må velge hva som skal overføres.');
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


}
