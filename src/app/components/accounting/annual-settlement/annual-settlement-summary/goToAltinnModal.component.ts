import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IModalOptions} from '@uni-framework/uni-modal';

@Component({
    selector: 'uni-go-to-altinn-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <article>
                <i class="material-icons-outlined">check</i>
                <header>Årsoppgjøret er levert i Altinn</header>
                <section class="alert warn">
                    <i class="material-icons">report_problem</i>
                    <article>Du må logge seg inn i Altinn for å kontrollere at dataene som er sendt inn er korrekt.</article>
                </section>
            </article>
            <footer>
                <button (click)="onClose.emit(false)">Lukk</button>
                <button class="button primary" (click)="onClose.emit(true)">Go til altinn.no
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6V8H5V19H16V14H18V20C18 20.2652 17.8946 20.5196 17.7071 20.7071C17.5196 20.8946 17.2652 21 17 21H4C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V7C3 6.73478 3.10536 6.48043 3.29289 6.29289C3.48043 6.10536 3.73478 6 4 6H10ZM21 3V11H19V6.413L11.207 14.207L9.793 12.793L17.585 5H13V3H21Z" fill="white"/>
                    </svg>
                </button>
            </footer>
        </section>
    `
})
export class GoToAltinnModalComponent {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();
    constructor() {
    }

    ngOnInit() {
    }
}
