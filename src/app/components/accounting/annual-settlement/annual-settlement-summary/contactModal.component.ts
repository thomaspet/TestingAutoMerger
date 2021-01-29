import {Component, EventEmitter, Input, Output} from '@angular/core';
import {IModalOptions} from '@uni-framework/uni-modal';
import {FieldType} from '@uni-framework/ui/uniform';

@Component({
    selector: 'uni-annual-settlement-summary-contact-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <article>
                <i class="material-icons-outlined">check_circle</i>
                <header>Utfylling av årsoppgjøret</header>
                <section>
                    <uni-form
                        [model]="data"
                        [fields]="fields"
                        [config]="{autofocus: true, showLabelAbove: true}"
                    ></uni-form>
                </section>
            </article>
            <footer>
                <button (click)="onClose.emit(null)">Avbryt</button>
                <button class="button c2a" (click)="onClose.emit(data)">Send inn
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 6V8H5V19H16V14H18V20C18 20.2652 17.8946 20.5196 17.7071 20.7071C17.5196 20.8946 17.2652 21 17 21H4C3.73478 21 3.48043 20.8946 3.29289 20.7071C3.10536 20.5196 3 20.2652 3 20V7C3 6.73478 3.10536 6.48043 3.29289 6.29289C3.48043 6.10536 3.73478 6 4 6H10ZM21 3V11H19V6.413L11.207 14.207L9.793 12.793L17.585 5H13V3H21Z" fill="black"/>
                    </svg>
                </button>
            </footer>
        </section>
    `
})
export class ContactModalComponent {
    @Input() options: IModalOptions = {};
    @Output() onClose = new EventEmitter();
    data: any;
    fields: any;
    constructor() {
    }

    ngOnInit() {
        this.fields = [
            {
                Property: 'UtfyllerNaringsoppgave',
                Label: 'Hvem har fyllt ut årsoppgjøret',
                FieldType: FieldType.DROPDOWN,
                Options: {
                    source: [
                        { id: 'Revisor', name: 'Revisor/Regnskapsfører'},
                        { id: 'Foretak', name: 'Foretaket selv'}
                    ],
                    displayProperty: 'name',
                    valueProperty: 'id'
                }
            },
            {
                Property: 'KontaktpersonNavn',
                Label: 'Henvendelse rettes til',
                FieldType: FieldType.TEXT
            },
            {
                Property: 'KontaktpersonEPost',
                Label: 'E-post',
                FieldType: FieldType.TEXT
            }
        ];
        this.data = this.options.data;
    }
}
