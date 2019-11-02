import {Component, Output, EventEmitter} from '@angular/core';
import {IUniModal, ConfirmActions} from '../interfaces';
import {environment} from 'src/environments/environment';

@Component({
    selector: 'user-license-agreement-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>Databehandleravtale</header>

            <article class="scrollable">
                <h3 style="margin: .25rem 0 1.25rem">
                    Bakgrunn
                    <a *ngIf="!isSrEnvironment" style="float: right;" href="https://support.unimicro.no/kundestotte/personvern-gdpr/databehandleravtale" target="_blank">
                        Les mer på våre nettsider
                    </a>
                </h3>

                <p>Ny personlovgivning, med utg.pkt. i EU sin nye personvernforordning innføres nå i Norge. Prinsippet er at alle «eier» sine egne personopplysninger, og nå har fått utvidede rettigheter knyttet til egne personopplysninger. På samme måte har alle som behandler (herunder lagrer) slike opplysninger fått utvidede plikter.</p>
                <p>{{companyName}} leverer m.a. løsninger for å føre regnskap, fakturere og utbetale lønn - som er underlagt ulike lover/regler knyttet til dette - men som samtidig vil inneholde personopplysninger.</p>
                <p>Når {{companyName}} da etter nytt lovverk kan sies å «behandle» personopplysninger, f.eks. gjennom at vi tilbyr løsninger hvor vi tar ansvar for å lagre data, eller får tilgang til kunders data for å utføre feilsøking, eller på annen måte bistå våre brukere (Skjermdeling o.l.) - så vil {{companyName}} pr. definisjon være en «Databehandler» etter personlovgivningen. Den behandlingsansvarlige vil være den virksomheten som «eier» dataene.</p>
                <p>Personlovgivningen krever da at det skal finnes en avtale mellom «Databehandler» og «Behandlingsansvarlig», som regulerer behandlingen av personopplysninger. En slik «Databehandleravtale» er nå utformet, og innføres for alle som benytter systemet.</p>

                <ng-container *ngIf="!isSrEnvironment">
                    <h3>For Regnskapsbyråer</h3>
                    <p>Når byrået har egne lisenser i systemet så er denne avtalen å se på som en underleverandøravtale overfor byrået sine klienter som man har oppdragsavtale med. Byrået må da ha en egen databehandleravtale med sine klienter, hvor denne avtalen må refereres til som en underleverandøravtale.</p>
                    <p>Når byrået bistår kunde som har egne lisenser i systemet, så er denne avtalen å se på som en databehandleravtale mellom {{companyName}} og byråets klient. Byrået og klienten kan da velge å benytte denne samme avtalen som sin egen databehandleravtale mellom byrået og klienter.</p>
                </ng-container>
            </article>

            <footer style="margin-top: 2rem">
                <mat-checkbox [(ngModel)]="licenseAgreement" style="margin-right: 2rem">
                    Godta databehandleravtale
                </mat-checkbox>

                <button class="secondary" (click)="reject()">Avbryt</button>
                <button class="c2a" (click)="confirm()" [disabled]="!licenseAgreement">Bekreft</button>
            </footer>
        </section>
    `
})
export class UserLicenseAgreementModal implements IUniModal {
    @Output() public onClose = new EventEmitter<ConfirmActions>();

    licenseAgreement: boolean = false;
    isSrEnvironment = environment.isSrEnvironment;
    companyName = environment.isSrEnvironment ? 'Sparebank 1 SR-Bank' : 'Uni Micro';

    public confirm() {
        if (this.licenseAgreement) {
            this.onClose.emit(ConfirmActions.ACCEPT);
        } else {
            window.alert('Du må godta avtalen før du kan gå videre');
        }
    }

    public reject() {
        const confirmed = confirm('Dersom du ikke godtar lisensen blir du logget ut av applikasjonen.');
        if (confirmed) {
            this.onClose.emit(ConfirmActions.REJECT);
        }
    }
}
