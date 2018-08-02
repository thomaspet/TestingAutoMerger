import {Component, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {IUniModal, ConfirmActions} from '../interfaces';


@Component({
    selector: 'user-license-agreement-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>Databehandleravtale</h1>
            </header>

            <article class="scrollable">
                <h3>
                    Bakgrunn
                    <a style="float: right;" href="https://support.unimicro.no/kundestotte/personvern-gdpr/databehandleravtale" target="_blank">
                        Les mer på våre nettsider
                    </a>
                </h3>

                <p>Ny personlovgivning, med utg.pkt. i EU sin nye personvernforordning innføres nå i Norge. Prinsippet er at alle «eier» sine egne personopplysninger, og nå har fått utvidede rettigheter knyttet til egne personopplysninger. På samme måte har alle som behandler (herunder lagrer) slike opplysninger fått utvidede plikter.</p>
                <p>Uni Micro leverer m.a. løsninger for å føre regnskap, fakturere og utbetale lønn - som er underlagt ulike lover/regler knyttet til dette - men som samtidig vil inneholde personopplysninger.</p>
                <p>Når Uni Micro da etter nytt lovverk kan sies å «behandle» personopplysninger, f.eks. gjennom at vi tilbyr løsninger hvor vi tar ansvar for å lagre data (UniEconomy), eller får tilgang til kunders data for å utføre feilsøking, eller på annen måte bistå våre brukere (Skjermdeling o.l.) - så vil Uni Micro pr. definisjon være en «Databehandler» etter personlovgivningen. Den behandlingsansvarlige vil være den virksomheten som «eier» dataene.</p>
                <p>Personlovgivningen krever da at det skal finnes en avtale mellom «Databehandler» og «Behandlingsansvarlig», som regulerer behandlingen av personopplysninger. En slik «Databehandleravtale» er nå utformet, og innføres for alle som benytter UniEconomy.</p>
                <h3>For Regnskapsbyråer</h3>
                <p>Når byrået har egne lisenser på UniEconomy så er denne avtalen å se på som en underleverandøravtale overfor byrået sine klienter som man har oppdragsavtale med. Byrået må da ha en egen databehandleravtale med sine klienter, hvor denne avtalen må refereres til som en underleverandøravtale.</p>
                <p>Når byrået bistår kunde som har egne lisenser på UniEconomy, så er denne avtalen å se på som en databehandleravtale mellom Uni Micro og byråets klient. Byrået og klienten kan da velge å benytte denne samme avtalen som sin egen databehandleravtale mellom byrået og klienter.</p>
            </article>

            <footer>
                <mat-checkbox [(ngModel)]="licenseAgreement">
                    Godta databehandleravtale
                </mat-checkbox>

                <button class="good" (click)="confirm()" [disabled]="!licenseAgreement">Bekreft</button>
                <button class="bad" (click)="reject()">Avbryt</button>
            </footer>
        </section>
    `,
    styles: [`
        mat-checkbox {
            float: left;
            margin-top: 1.25rem;
        }

        h3:first-of-type {
            margin: .25rem 0 1.25rem;
        }
    `]
})
export class UserLicenseAgreementModal implements IUniModal {
    @Output() public onClose: EventEmitter<ConfirmActions> = new EventEmitter<ConfirmActions>();

    public licenseAgreement: boolean = false;

    public confirm() {
        if (this.licenseAgreement) {
            this.onClose.emit(ConfirmActions.ACCEPT);
        } else {
            window.alert('Du må godta avtalen før du kan gå videre');
        }
    }

    public reject() {
        const confirmed = confirm('Hvis du ikke godtar lisensen blir du logget ut av applikasjonen.');
        if (confirmed) {
            this.onClose.emit(ConfirmActions.REJECT);
        }
    }
}
