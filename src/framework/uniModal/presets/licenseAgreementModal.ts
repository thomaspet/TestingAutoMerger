import {Component, Output, EventEmitter, ViewChild, ElementRef} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {IUniModal, ConfirmActions} from '@uni-framework/uniModal/interfaces';

@Component({
    selector: 'license-agreement-modal',
    template: `
        <section role="dialog" class="uni-modal"
                (clickOutside)="bad()"
                (keydown.esc)="bad()">
            <header>
                <h1>Lisens</h1>
                <button class="modal-close-button" (click)="bad()"></button>
            </header>
            <article>
                <object data="https://public-files.unieconomy.no/files/license/Lisensavtale_UniEconomy_v2.pdf" type="application/pdf">
                  alt : <a href="https://public-files.unieconomy.no/files/license/Lisensavtale_UniEconomy_v2.pdf">License.pdf</a>
                </object>

                <section class="uni-checkbox">
                    <input type="checkbox" id="agreement-checkbox" [(ngModel)]="licenceAgreement" />
                    <label for="agreement-checkbox">Godta lisensavtale</label>
                </section>

            </article>
            <footer>
                <button class="good" (click)="confirm()">Bekreft</button>
                <button class="bad" (click)="reject()">Avbryt</button>
            </footer>
        </section>
    `
})
export class LicenseAgreementModal implements IUniModal {
    @Output() public onClose: EventEmitter<ConfirmActions> = new EventEmitter<ConfirmActions>();

    public licenceAgreement: boolean = false;

    public confirm() {
        if (this.licenceAgreement) {
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
