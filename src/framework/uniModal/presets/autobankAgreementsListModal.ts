import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import { IModalOptions, IUniModal, UniConfirmModalV2, ConfirmActions, UniAutobankAgreementModal} from '@uni-framework/uniModal/barrel';
import {UniModalService} from '../modalService';

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
                            <th style="display: none"></th>
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
                            <td class="text-right-in-table" style="position: relative; display: none;">
                                <span class="agreement-edit" (click)="editAgreements(agreement)" title="Rediger avtale"> </span>
                                <span class="agreement-delete" (click)="deleteAgreements(agreement)" title="Slett avtale"> </span>
                            </td>
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

    constructor(private modalService: UniModalService) { }

    public ngOnInit() {
        if (this.options &&  this.options.data) {
            this.options.data.agreements.forEach((item) => {
                item.deleteTagged = false;
            });

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

    public editAgreements(agreement) {
        // this.editmode = true;
        this.modalService.open(UniAutobankAgreementModal, { data: agreement });
    }

    public deleteAgreements(agreement) {
        const modalOptions: IModalOptions = {
            buttonLabels: {
                accept: 'Ja',
                cancel: 'Avbryt'
            },
            header: 'Slett autobankavtale',
            message: 'Er du helt sikker på at du vil slette autobankavtalen for ' + agreement.Name + ' ?',
            warning: 'Dette kan ikke angres, og for å aktivere igjen, må du gjennomgå oppstartsprosessen på nytt.'
        };

        this.modalService.open(UniConfirmModalV2, modalOptions).onClose.subscribe((res) => {
            if (res === ConfirmActions.ACCEPT) {
                // Delete
            }
        });
    }

    public close() {
        this.onClose.emit();
    }
}
