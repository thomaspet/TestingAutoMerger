import {Component, OnInit, Input, Output, EventEmitter, ViewChild} from '@angular/core';
import {PaycheckSending} from './paycheckSending';
import {IUniModal, IModalOptions} from '../../../../../framework/uni-modal';
import {IUniSaveAction} from '../../../../../framework/save/save';

@Component({
    selector: 'paycheck-sender-modal',
    templateUrl: './paycheckSenderModal.html'
})

export class PaycheckSenderModal implements OnInit, IUniModal {
    @ViewChild(PaycheckSending) private paycheckSending: PaycheckSending;
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    public saveActions: IUniSaveAction[] = [];
    public checkedEmps: number;
    public busy: boolean;

    constructor() { }

    public ngOnInit() {
        this.updateSaveActions();
    }

    private updateSaveActions() {
        this.saveActions = this.getSaveActions(!!this.checkedEmps);
    }

    private getSaveActions(isActive: boolean): IUniSaveAction[] {
        return [
            {
                label: 'Send e-post/Skriv ut',
                action: this.handlePaychecks.bind(this),
                disabled: !isActive
            },
            {
                label: 'Skriv ut alle valgte',
                action: this.printAllPaychecks.bind(this),
                disabled: !isActive
            }
        ];
    }

    public printAllPaychecks() {
        this.paycheckSending.handlePaychecks(true);
    }

    public handlePaychecks() {
        this.paycheckSending.handlePaychecks();
    }

    public close() {
        this.onClose.next(true);
    }

    public onSelectedEmps(event: number) {
        this.checkedEmps = event;
        this.updateSaveActions();
    }

    public setBusy(event: boolean) {
        this.busy = event;
    }
}
