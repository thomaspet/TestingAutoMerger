import {Component, Type, Input, ViewChild, OnInit} from '@angular/core';
import {FieldType} from '../../../../unientities';
import {UniModal} from '../../../../../framework/modals/modal';
import {ErrorService} from '../../../../services/services';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {ConfirmActions, IModalAction} from '../../../../../framework/modals/confirm';
import {LocalDate} from '../../../../unientities';

declare const moment;

export interface IReminderConfirmModalConfig {
    reminders?: any;
    model?: any;
    actions?: {
        accept?: IModalAction,
        reject?: IModalAction,
        cancel?: IModalAction
    };
}

@Component({
    selector: 'reminder-confirm-form',
    templateUrl: 'app/components/sales/reminder/list/reminderConfirmModal.html'
})
export class ReminderConfirmForm implements OnInit {
    @Input() public config: any = {};
    private formConfig: any = {};
    private fields: any[] = [];

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService
    ) {}

    public ngOnInit() {
        this.setupForm();
    }

    private setupForm() {
       this.fields = [
            {
                EntityType: 'CustomerInvoiceReminder',
                Property: 'ReminderDate',
                FieldType: FieldType.LOCAL_DATE_PICKER,
                Label: 'Purredato',
                LineBreak: true
            }
       ];
    }
}

@Component({
    selector: 'reminder-confirm-modal',
    template: `<uni-modal [type]='type' [config]='config'></uni-modal>`
})
export class ReminderConfirmModal {
    @ViewChild(UniModal) public modal: UniModal;

    private config: IReminderConfirmModalConfig;
    public type: Type<any> = ReminderConfirmForm;

    constructor(
        private toastService: ToastService
    ) {
        this.config = {
            actions: {
                accept: {
                    text: 'Ok',
                    method: () => { this.close(); }
                },
                cancel: {
                    text: 'Avbryt',
                    method: () => { this.close(); }
                }
            }
        };
    }

    public open() {
        this.modal.open();
    }

    public close() {
        this.modal.close();
    }

    private onClose: () => void = () => {};

    public confirm(reminders): Promise<any> {
        return new Promise((resolve, reject) => {

            this.config.model = { ReminderDate: new LocalDate() };
            this.config.reminders = reminders;

            this.config.actions.accept = {
                text: 'Ok',
                method: () => { resolve({status: ConfirmActions.ACCEPT, model: this.config.model}); this.close(); }
            };

            this.config.actions.cancel = {
                text: 'Angre',
                method: () => { resolve({status: ConfirmActions.CANCEL}); this.close(); }
            };

            this.onClose = () => {
                resolve(ConfirmActions.REJECT);
            };
            this.modal.open();
        });
    }
}
