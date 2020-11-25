import {Component, Output, EventEmitter} from '@angular/core';
import {IUniModal, ConfirmActions} from '../interfaces';
import {ElsaAgreementService} from '@app/services/services';
import * as marked from 'marked';

@Component({
    selector: 'user-license-agreement-modal',
    template: `
        <section role="dialog" class="uni-modal" style="min-height: 175px">
            <header>Databehandleravtale</header>

            <section *ngIf="busy" class="modal-spinner">
                <mat-spinner class="c2a"></mat-spinner>
            </section>

            <article *ngIf="!errorMessage.length" class="scrollable" [innerHTML]="agreementMarkdown"></article>

            <article *ngIf="errorMessage.length">{{errorMessage}}</article>

            <footer style="margin-top: 2rem" *ngIf="!busy && !errorMessage.length">
                <mat-checkbox [(ngModel)]="accepted" style="margin-right: 2rem">
                    Godta databehandleravtale
                </mat-checkbox>

                <button class="secondary" (click)="reject()">Avbryt</button>
                <button class="c2a" (click)="confirm()" [disabled]="!accepted">Bekreft</button>
            </footer>

            <footer *ngIf="!busy && errorMessage.length">
                <button class="c2a" (click)="ok()">OK</button>
            </footer>
        </section>
    `
})
export class UserLicenseAgreementModal implements IUniModal {
    @Output() public onClose = new EventEmitter<ConfirmActions>();

    busy: boolean = false;
    accepted: boolean = false;
    agreementMarkdown: string;
    errorMessage = '';

    constructor(private elsaAgreementService: ElsaAgreementService) {
        this.errorMessage = '';
        this.busy = true;
        this.elsaAgreementService.getUserLicenseAgreement().subscribe(agreement => {
            if (agreement) {
                if (agreement.AgreementText) {
                    this.parseMarkdown(agreement.AgreementText);
                } else {
                    this.errorMessage = 'Fant ingen avtaletekst. Kontakt systemansvarlig.';
                }
            } else {
                this.errorMessage = 'Fant ingen databehandleravtale. Kontakt systemansvarlig.';
            }
            this.busy = false;
        }, err => {
                this.errorMessage = 'Noe gikk galt da vi prøvde å hente databehandleravtalen. Prøv igjen.';
                this.busy = false;
            }
        );
    }

    parseMarkdown(agreementText: string) {
        try {
            const decoded = decodeURI(agreementText);
            this.agreementMarkdown = marked.parse(decoded) || '';
        } catch (e) {
            console.error(e);
        }
    }

    public confirm() {
        if (this.accepted) {
            this.onClose.emit(ConfirmActions.ACCEPT);
        } else {
            window.alert('Du må godta avtalen før du kan gå videre.');
        }
    }

    public reject() {
        const confirmed = confirm('Dersom du ikke godtar lisensen blir du logget ut av applikasjonen.');
        if (confirmed) {
            this.onClose.emit(ConfirmActions.REJECT);
        }
    }

    public ok() {
        const confirmed = confirm('Du vil nå bli logget ut av applikasjonen.');
        if (confirmed) {
            this.onClose.emit(ConfirmActions.REJECT);
        }
    }
}
