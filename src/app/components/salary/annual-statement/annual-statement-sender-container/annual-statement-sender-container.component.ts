import {Component, OnInit, ViewChild} from '@angular/core';
import {IUniSaveAction} from '../../../../../framework/save/save';
import {AnnualStatementSenderComponent} from '../annual-statement-sender/annual-statement-sender.component';
import {ErrorService} from '../../../../services/services';

@Component({
    selector: 'uni-annual-statement-sender-container',
    templateUrl: './annual-statement-sender-container.component.html',
    styleUrls: ['./annual-statement-sender-container.component.sass']
})
export class AnnualStatementSenderContainerComponent implements OnInit {
    public saveActions: IUniSaveAction[] = [];
    @ViewChild(AnnualStatementSenderComponent, { static: true }) private senderComponent: AnnualStatementSenderComponent;
    constructor(private errorService: ErrorService) { }

    public ngOnInit() {
        this.saveActions = this.getSaveActions(false);
    }

    private getSaveActions(isActive: boolean): IUniSaveAction[] {
        return [
            {
                label: 'Send e-post/Skriv ut',
                action: this.handleAnnualStatements.bind(this),
                disabled: !isActive
            },
            {
                label: 'Skriv ut alle valgte',
                action: this.printAllAnnualStatements.bind(this),
                disabled: !isActive
            }
        ];
    }

    private handleAnnualStatements(done: (msg: string) => void) {
        this.senderComponent
            .handleAnnualStatementObs(false)
            .catch((err, obs) => {
                done('sending av årsoppgave feilet');
                return this.errorService.handleRxCatch(err, obs);
            })
            .subscribe(response => done(response ? 'Årsoppgaver er sendt' : 'Sending av valgte årsoppgaver feilet'));
    }

    private printAllAnnualStatements(done: (msg: string) => void) {
        this.senderComponent
            .handleAnnualStatements(true);
        done('');
    }

    public onSelectedEmps(event: number) {
        this.saveActions = this.getSaveActions(!!event);
    }

}
