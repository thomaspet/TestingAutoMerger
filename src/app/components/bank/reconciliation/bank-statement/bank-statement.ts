import {Component} from '@angular/core';
import {BankService} from '@app/services/services';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import * as moment from 'moment';

@Component({
    selector: 'uni-bank-statement-list',
    templateUrl: './bank-statement.html',
    styleUrls: ['../reconciliation-list/reconciliation-list.sass']
})

export class BankStatement {

    bankStatements: any[] = [];

    constructor (
        private bankService: BankService,
        private toast: ToastService
    ) { }

    ngOnInit() {
        this.getDataAndLoadList();
    }

    getDataAndLoadList() {
        this.bankService.getBankStatementListData().subscribe((bankStatements) => {
            if (bankStatements && bankStatements.Data) {
                this.bankStatements = bankStatements.Data.map((sm) => {
                    sm._periodeText = moment(sm.FromDate).format('DD. MMM YYYY') + ' - ' + moment(sm.ToDate).format('DD. MMM YYYY');
                    return sm;
                });
            }
        }, err => {
            this.toast.addToast('Kunne ikke hente kontoutskrifter', ToastType.bad, 5);
        });
    }

    getStatusText(statement: any) {
        if (statement.StatusCode === 48001) {
            return 'Åpen';
        } else {
            return 'Ferdigstilt';
        }
    }

    getActions(statement: any) {
        const actions = [
            { label: 'Slett avstemning', value: 'delete' }
        ];

        if (statement.StatusCode === 48002) {
             actions.unshift({ label: 'Gjenåpne avstemning', value: 'open' });
        } else {
            actions.unshift({ label: 'Ferdigstill avstemning', value: 'close' });
        }

        return actions;
    }

    onActionClick(action: any, statement: any, index: number) {
        switch (action.value) {
            case 'open':
                this.callBankStatementAction(statement.ID, 'reopen');
                break;
            case 'close':
                this.callBankStatementAction(statement.ID, 'complete');
                break;
            case 'delete':
                this.bankService.deleteBankStatement(statement.ID).subscribe(() => {
                    this.bankStatements.splice(index, 1);
                    this.toast.addToast('Kontoutskrift slettet', ToastType.good, 5);
                }, err => {
                    this.toast.addToast('Kunne ikke slette kontoutskrift', ToastType.bad, 5);
                });
                break;
        }
    }

    callBankStatementAction(id: number, action: string) {
        this.bankService.bankStatementActions(id, action).subscribe((response) => {
            const statement = this.bankStatements.find(sm => sm.ID === id);
            // Update the statement with new statuscode and invoke change
            statement.StatusCode = response.StatusCode;
            this.bankStatements = [...this.bankStatements];
            this.toast.addToast(`${action === 'reopen' ? 'Kontoutskrift gjenåpnet' : 'Kontoutskrift ferdigstilt'}`, ToastType.good, 5);
        }, err => {
            this.toast.addToast('Kunne ikke oppdatere kontoutskrift', ToastType.bad, 5);
        });
    }

}
