import { Component, OnInit } from '@angular/core';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { BankJournalSession, DebitCreditEntry, ErrorService, PageStateService } from '@app/services/services';
import { TabService, UniModules } from '@app/components/layout/navbar/tabstrip/tabService';
export { ExpensePrepaid } from './prepaid/prepaid';
export { ExpenseEntries } from './entries/entries';
export { ExpensePayable } from './payable/payable';

@Component({
    selector: 'expense',
    templateUrl: './expense.html',
    styleUrls: [ './expense.sass' ]
})
export class Expense implements OnInit {

    busy = true;
    viewModePayable = false;

    public saveActions: IUniSaveAction[] = [{
        label: 'Nytt bilag',
        action: (done) => setTimeout(() => { this.clear(); done(); }), main: true, disabled: false
    }, {
        label: 'Lagre',
        action: (done) => setTimeout(() => this.save().then(() => done())), main: true, disabled: false
    }];

    public toolbarConfig: IToolbarConfig = {
        title: this.getTitle(), omitFinalCrumb: true
    };

    constructor(
        public session: BankJournalSession,
        private errorService: ErrorService,
        private pageStateService: PageStateService,
        private tabService: TabService) {
        session.initialize()
            .finally( () => this.busy = false)
            .subscribe( () => this.sessionReady() );

        this.tabService.addTab({
            name: 'NAVBAR.EXPENSE',
            url: '/accounting/expense',
            moduleID: UniModules.Bills,
            active: true
        });

        this.checkPath();
    }

    private getTitle(): string {
        return this.viewModePayable ? 'Kvittering - tilbakebetaling' : 'Kvittering - forhåndsbetalt';
    }

    ngOnInit() {
        this.clear();
    }

    sessionReady() {
    }

    private checkPath() {
        const params = this.pageStateService.getPageState();
        if (params.filter) {

        }
    }

    save(): Promise<boolean> {
        return new Promise( (resolve, reject) => {
            return this.session.save().subscribe( x => {
                resolve(true);
            }, err => { this.errorService.handle(err); resolve(false); });
        });
    }

    clear() {
        this.session.clear();
        this.session.items.push(new DebitCreditEntry(new Date()));
    }

    flipViewMode() {
        this.viewModePayable = !this.viewModePayable;
        this.toolbarConfig.title = this.getTitle();
    }

}
