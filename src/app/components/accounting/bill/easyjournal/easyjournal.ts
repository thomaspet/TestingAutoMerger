import { Component, OnInit } from '@angular/core';
import { IUniSaveAction } from '@uni-framework/save/save';
import { IToolbarConfig } from '@app/components/common/toolbar/toolbar';
import { BankJournalSession, DebitCreditEntry, ErrorService } from '@app/services/services';

@Component({
    selector: 'easyjournal',
    templateUrl: './easyjournal.html',
    styleUrls: [ './easyjournal.sass' ]
})
export class EasyJournal implements OnInit {

    busy = true;


    public saveActions: IUniSaveAction[] = [{
        label: 'Nytt bilag',
        action: (done) => setTimeout(() => { this.clear(); done(); }), main: true, disabled: false
    }, {
        label: 'Lagre',
        action: (done) => setTimeout(() => this.save().then(() => done())), main: true, disabled: false
    }];

    public toolbarConfig: IToolbarConfig = {
        title: 'Manuelt bilag', omitFinalCrumb: true
    };

    constructor(public session: BankJournalSession, private errorService: ErrorService) {
        session.initialize()
            .finally( () => this.busy = false)
            .subscribe( () => this.sessionReady() );
    }

    ngOnInit() {
        this.clear();
    }

    sessionReady() {
    }

    onEdit(fieldName: string, item: DebitCreditEntry, value: string) {
        // console.log('onEdit:' + fieldName, $event);
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
        this.addRow();
    }

    addRow() {
        this.session.items.push(new DebitCreditEntry(new Date()));
    }

    removeRow(row: DebitCreditEntry) {
        const ix = this.session.items.indexOf(row);
        this.session.items.splice( ix, 1);
    }

    dropClick(mse: MouseEvent) {
        if (mse.offsetX > (<any>mse.target).clientWidth - 35) {
            console.log('Drop it down!');
        }
    }
}
