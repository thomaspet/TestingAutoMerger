import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IModalOptions} from '@uni-framework/uni-modal';

@Component({
    selector: 'uni-sumary-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header>Bokfør disponeringer</header>
            <article>
                <p>
                    Nå overfører vi resultatet dit over til balansen....blabla.
                </p>
                <simple-table>
                    <thead>
                        <tr>
                            <th>Konto</th>
                            <th>Kontonavn</th>
                            <th>Sum</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let account of accounts">
                            <td>{{account.AccountNumber}}</td>
                            <td>{{account.Description}}</td>
                            <td>{{account.Amount}}</td>
                        </tr>
                    </tbody>
                </simple-table>
            </article>
            <footer style="display:flex; align-items: center; justify-content: center">
                <button class="secondary" (click)="onClose.emit(false)"> Avbryt </button>
                <button class="c2a" (click)="onClose.emit(true)"> Bokfør </button>
            </footer>
        </section>
    `
})
export class UniSummaryModalComponent {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();
    accounts;
    constructor() {
    }

    ngOnInit() {
        this.accounts = this.options.data || [];
    }
}
