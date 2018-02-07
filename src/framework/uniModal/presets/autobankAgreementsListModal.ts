import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { IModalOptions, IUniModal } from '@uni-framework/uniModal/interfaces';

@Component({
    selector: 'uni-autobank-agreement-list-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 70vw;">
            <header><h1>Mine autobankavtaler</h1></header>

            <article>
                <table class="agreement-table" *ngIf="agreements">
                    <thead>
                        <tr>
                            <th>Bank & kontonr</th>
                            <th>Epost</th>
                            <th class="text-center-in-table">Manuel godkjenning</th>
                            <th class="text-center-in-table">Utgående</th>
                            <th class="text-center-in-table">Innkommende</th>
                            <th class="text-right-in-table">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let agreement of agreements">
                            <td> {{ agreement.Name }} </td>
                            <td> {{ agreement.Email }} </td>
                            <td class="text-center-in-table"> {{ agreement.BankAcceptance ? 'Ja' : 'Nei' }} </td>
                            <td class="text-center-in-table"> {{ agreement.IsOutgoing ? 'Ja' : 'Nei'  }} </td>
                            <td class="text-center-in-table"> {{ agreement.IsInbound ? 'Ja' : 'Nei'  }} </td>
                            <td class="text-right-in-table"> {{ getStatusText(agreement.StatusCode) }} </td>
                        </tr>
                    </tbody>
                </table>
            </article>

            <footer>
                <button (click)="close()" class="good">Lukk</button>
            </footer>
        </section>
    `
})

export class UniAutobankAgreementListModal implements IUniModal, OnInit {

    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    public agreements: any[];

    constructor( ) { }

    public ngOnInit() {
        if (this.options &&  this.options.data) {
            this.agreements = this.options.data.agreements;
        }
    }

    public getStatusText(code: number) {
        let statusText = '';
        switch (code) {
            case 700001:
                statusText = 'Manuell registrering i bank';
                break;
            case 700002:
                statusText = 'Venter på signering i bank';
                break;
            case 700003:
                statusText = 'Venter på godkjenning i bank';
                break;
            case 700004:
                statusText = 'Venter på godkjenning hos meldingssentral';
                break;
            case 700005:
                statusText = 'Aktiv';
                break;
            case 700006:
                statusText = 'Kansellert';
                break;
            default:
                break;
        }
        return statusText;
    }

    public close() {
        this.onClose.emit();
    }
}