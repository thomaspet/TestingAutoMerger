import { Component, OnInit } from '@angular/core';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { BankJournalSession, DebitCreditEntry, ErrorService } from '@app/services/services';
export { EasyJournalPrepaid } from './prepaid/prepaid';
export { EasyJournalEntries } from './entries/entries';
export { EasyJournalPayable } from './payable/payable';

@Component({
    selector: 'easyjournal',
    templateUrl: './easyjournal.html',
    styleUrls: [ './easyjournal.sass' ]
})
export class EasyJournal implements OnInit {

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

    constructor(public session: BankJournalSession, private errorService: ErrorService) {
        session.initialize()
            .finally( () => this.busy = false)
            .subscribe( () => this.sessionReady() );
    }

    private getTitle(): string {
        return this.viewModePayable ? 'Kvittering - tilbakebetaling' : 'Kvittering - forhåndsbetalt';
    }

    ngOnInit() {
        this.clear();
    }

    sessionReady() {
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
