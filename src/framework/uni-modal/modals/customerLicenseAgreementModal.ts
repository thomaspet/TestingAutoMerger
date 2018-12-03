import {Component, Output, EventEmitter} from '@angular/core';
import {IUniModal, ConfirmActions} from '../interfaces';


@Component({
    selector: 'customer-license-agreement-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>Selskapslisens</h1>
            </header>
            <article>
                <object data="https://public-files.unieconomy.no/files/license/Lisensavtale_UniEconomy_v2.pdf" type="application/pdf">
                  alt : <a href="https://public-files.unieconomy.no/files/license/Lisensavtale_UniEconomy_v2.pdf">License.pdf</a>
                </object>

                <mat-checkbox [(ngModel)]="licenseAgreement">
                    Godta lisensavtale
                </mat-checkbox>

            </article>
            <footer>
                <button class="good" (click)="confirm()" [disabled]="!licenseAgreement">Bekreft</button>
                <button class="bad" (click)="reject()">Avbryt</button>
            </footer>
        </section>
    `
})
export class CustomerLicenseAgreementModal implements IUniModal {
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
        const confirmed = confirm('Dersom du ikke godtar lisensen vil du bli logget ut. Klikk OK for å logge ut.');
        if (confirmed) {
            this.onClose.emit(ConfirmActions.REJECT);
        }
    }
}
