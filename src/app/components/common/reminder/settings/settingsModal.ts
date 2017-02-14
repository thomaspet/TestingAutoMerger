import {Component, Type, Input, ViewChild} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';
import {ErrorService} from '../../../../services/services';
import {ToastService} from '../../../../../framework/uniToast/toastService';
import {ConfirmActions, IModalAction} from '../../../../../framework/modals/confirm';
import {LocalDate} from '../../../../unientities';
import {ReminderSettings} from './reminderSettings';

declare const moment;

export interface IReminderSettingsModalConfig {
    model?: any;
    actions: {
        accept: IModalAction,
        cancel: IModalAction
    };
}

@Component({
    selector: 'reminder-settings-form',
    templateUrl: 'app/components/common/reminder/settings/settingsModal.html'
})
export class ReminderSettingsForm {
    @ViewChild(ReminderSettings) public reminderSettings: ReminderSettings;
    @Input() public config: any = {};

    constructor() {}
}

@Component({
    selector: 'reminder-settings-modal',
    template: `<uni-modal [type]='type' [config]='config'></uni-modal>`
})
export class ReminderSettingsModal {
    @ViewChild(UniModal) public modal: UniModal;

    private config: IReminderSettingsModalConfig;
    public type: Type<any> = ReminderSettingsForm;

    constructor(
        private toastService: ToastService,
        private errorService: ErrorService
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

    public save(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.modal.getContent().then((component: ReminderSettingsForm) => {
                component.reminderSettings.save().then(() => {
                    resolve();
                }).catch((err) => {
                    reject(err);
                });
            });
        });
    }

    private onClose: () => void = () => null;

    public settings(): Promise<any> {
        return new Promise((resolve, reject) => {

            this.config.model = { ReminderDate: new LocalDate() };

            this.config.actions.accept = {
                text: 'Ok',
                method: () => {
                    this.save().then(() => {
                        resolve({status: ConfirmActions.ACCEPT, model: this.config.model});
                        this.close();
                    }).catch((err) => {
                        this.errorService.handle(err);
                    });
                }
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
