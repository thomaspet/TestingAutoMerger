import {Component, Output, EventEmitter} from '@angular/core';
import {Router} from '@angular/router';
import {BankService} from '@app/services/services';
import {ToastService, ToastType} from '@uni-framework/uniToast/toastService';
import * as moment from 'moment';

@Component({
    selector: 'uni-bank-statement-list',
    templateUrl: './bank-statement.html',
    styleUrls: ['../reconciliation-list/reconciliation-list.sass']
})

export class BankStatement {
    @Output() statementChanged = new EventEmitter<any>();

    bankStatements: any[] = [];
    busy: boolean = false;
    dataLoaded: boolean = false;

    constructor (
        private bankService: BankService,
        private toast: ToastService,
        private router: Router
    ) {}

    ngOnInit() {
        this.getDataAndLoadList();
    }

    getDataAndLoadList() {
        this.bankService.getBankStatementListData().subscribe((bankStatements) => {
            if (bankStatements && bankStatements.Data) {
                this.bankStatements = bankStatements.Data.map((sm) => {
                    sm._periodeText = moment(sm.FromDate).format('DD. MMM YYYY') + ' - ' + moment(sm.ToDate).format('DD. MMM YYYY');
                    sm._open = false;
                    sm.entries = [];
                    return sm;
                });
            }
            this.dataLoaded = true;
        }, err => {
            this.toast.addToast('Kunne ikke hente kontoutskrifter', ToastType.bad, 5);
            this.dataLoaded = true;
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
            { label: 'Slett avstemming', value: 'delete' }
        ];

        if (statement.StatusCode === 48002) {
             actions.unshift({ label: 'Gjenåpne avstemming', value: 'open' });
        } else {
            actions.unshift({ label: 'Ferdigstill avstemming', value: 'close' });
        }

        return actions;
    }

    goToReconciliationView() {
        this.router.navigateByUrl('/bank-reconciliation');
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
                this.busy = true;
                this.bankService.deleteBankStatement(statement.ID).subscribe(() => {
                    this.bankStatements.splice(index, 1);
                    this.toast.addToast('Kontoutskrift slettet', ToastType.good, 5);
                    this.busy = false;
                    this.statementChanged.emit(true);
                }, err => {
                    this.toast.addToast('Kunne ikke slette kontoutskrift', ToastType.bad, 5,
                        err && err.error && err.error.Messages && err.error.Messages[0].Message);
                    this.busy = false;
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

    statementClick(statement: any) {

        if (!statement._open) {
            this.bankService.getBankStatementEntriesOnStatement(statement.ID).subscribe((response: any[]) => {
                statement.entries = response.map(res => {
                    res._periodeText = moment(res.BookingDate).format('DD.MMM YYYY');
                    return res;
                });
                statement._open = !statement._open;
            });
        } else {
            statement._open = !statement._open;
        }
    }

}
