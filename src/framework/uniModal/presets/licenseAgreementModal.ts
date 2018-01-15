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
                <input #checkbox type="checkbox"><label #label>Godta</label>
            </article>
            <footer>
                <button class="good" (click)="good()">Ok</button>
                <button class="bad" (click)="bad()">Avbryt</button>
            </footer>
        </section>
    `
})
export class LicenseAgreementModal implements IUniModal {

    @Output() public onClose: EventEmitter<ConfirmActions> = new EventEmitter<ConfirmActions>();

    @ViewChild('checkbox') public checkbox: ElementRef;
    @ViewChild('label') public label: ElementRef;

    public hasAcceptedLicense: boolean = false;


    public ngOnInit() {
        Observable
            .fromEvent(this.label.nativeElement, 'click')
            .subscribe(eventClick => this.toggleHasAcceptedLicense());
    }

    private toggleHasAcceptedLicense() {
        if (this.hasAcceptedLicense) {
            this.checkbox.nativeElement.removeAttribute('checked');
        } else {
            this.checkbox.nativeElement.setAttribute('checked', true);
        }
        this.hasAcceptedLicense = !this.hasAcceptedLicense;
    }

    public good() {
        if (!this.hasAcceptedLicense) {
            alert('Du må huke av for at du godtar lisensen før du kan gå videre.');
        } else {
            this.onClose.emit(ConfirmActions.ACCEPT);
        }
    }

    public bad() {
        const confirmed = confirm('Hvis du ikke godtar lisensen så blir du logget ut igjen.');
        if (confirmed) {
            this.onClose.emit(ConfirmActions.REJECT);
        }
    }
}
