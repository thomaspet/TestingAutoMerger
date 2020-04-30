import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';

@Component({
    selector: 'draftline-description-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 30vw">
            <header>Beskrivelse på kladd</header>

            <article>
                <span>Legg til beskrivelse:</span>
                <br>
                <input type="text"
                    id="text_input"
                    style="width: 100%;"
                    (keydown.enter)="onClose.emit(text)"
                    [(ngModel)]="text"
                />
                <BR/>
                Bilagsnummer lagres ikke, og settes på ny når kladd hentes frem igjen.
            </article>

            <footer>
                <button class="secondary" (click)="onClose.emit(null)">
                    Avbryt
                </button>

                <button class="c2a" (click)="onClose.emit(text)">
                    Lagre
                </button>
            </footer>
        </section>
    `
})
export class DraftLineDescriptionModal implements IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose = new EventEmitter();

    text: string;

    ngAfterViewInit() {
        setTimeout(function() {
            if (document.getElementById('text_input')) {
                document.getElementById('text_input').focus();
            }
        });
    }
}
