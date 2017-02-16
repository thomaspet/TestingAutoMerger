import {Component, Type, ViewChild} from '@angular/core';
import {CustomerInvoiceReminder} from '../../../../unientities';
import {UniModal} from '../../../../../framework/modals/modal';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {ConfirmActions, IModalAction} from '../../../../../framework/modals/confirm';
import {ReminderSending} from './reminderSending';
import {
    ErrorService,
    ReportDefinitionService
} from '../../../../services/services';

declare const moment;

export interface IReminderSendingModalConfig {
    actions?: {
        send?: IModalAction;
        print?: IModalAction;
        reject?: IModalAction;
        cancel?: IModalAction;
    };
}

@Component({
    selector: 'reminder-sending-modal-content',
    templateUrl: './ReminderSendingModal.html'
})
export class ReminderSendingModalContent {
    @ViewChild(ReminderSending) public reminderSending: ReminderSending;

    constructor(
        private errorService: ErrorService
    ) {}
}

@Component({
    selector: 'reminder-sending-modal',
    template: `<uni-modal [type]='type' [config]='config'></uni-modal>`
})
export class ReminderSendingModal {
    @ViewChild(UniModal) public modal: UniModal;

    private config: IReminderSendingModalConfig;
    public type: Type<any> = ReminderSendingModalContent;

    constructor(
        private toastService: ToastService,
        private reportDefinitionService: ReportDefinitionService,
        private errorService: ErrorService
    ) {
        this.config = {
            actions: {
                send: {
                    text: 'Ok',
                    method: () => { this.close(); }
                },
                print: {
                    text: 'Print',
                    method: () => { }
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

    public printAll() {
        this.modal.getContent().then((component: ReminderSendingModalContent) => {
            component.reminderSending.sendPrint(true);
        });
    }

    public sendAll() {
        this.modal.getContent().then((component: ReminderSendingModalContent) => {
            component.reminderSending.sendEmail();
            component.reminderSending.sendPrint(false);
        });
    }

    private onClose: () => void = () => {};

    public confirm(reminders: CustomerInvoiceReminder[]): Promise<any> {
        return new Promise((resolve, reject) => {

            this.modal.getContent().then((component: ReminderSendingModalContent) => {
                console.log('content', component);
                console.log('reminders', reminders);
                component.reminderSending.updateReminderList(reminders);
            });

            this.config.actions.send = {
                text: 'Send valgte',
                method: () => {
                    this.sendAll();
                }
            };

            this.config.actions.print = {
                text: 'Skriv ut alle',
                method: () => {
                    this.printAll();
                }
            };

            this.config.actions.cancel = {
                text: 'Lukk',
                method: () => { resolve(ConfirmActions.CANCEL); this.close(); }
            };

            this.onClose = () => {
                resolve(ConfirmActions.REJECT);
            };
            this.modal.open();
        });
    }
}
