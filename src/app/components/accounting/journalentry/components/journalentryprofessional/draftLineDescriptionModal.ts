import {Component, Input, Output, EventEmitter, OnInit, ViewChild, AfterViewInit} from '@angular/core';
import {IUniModal, IModalOptions} from '../../../../../../framework/uniModal/barrel';

@Component({
    selector: 'draftline-description-modal',
    template: `
        <section
            role="dialog"
            class="uni-modal"
            style="width: 20vw"
            (clickOutside)="close()"
            (keydown.esc)="close()">

            <header><h1>Beskrivelse på kladd</h1></header>
            <article class='modal-content'>
                <span>Legg til beskrivelse:</span>
                <br>
                <input id="text_input" type="text" [(ngModel)]="text">
            </article>

            <footer>
                <button *ngIf="options.buttonLabels.accept" class="good" id="good_button_ok" (click)="accept()">
                    {{options.buttonLabels.accept}}
                </button>

                <button *ngIf="options.buttonLabels.cancel" class="cancel" (click)="close()">
                    {{options.buttonLabels.cancel}}
                </button>
            </footer>
        </section>
    `
})
export class DraftLineDescriptionModal implements IUniModal, OnInit, AfterViewInit {
    @Input() public options: IModalOptions;

    @Output() public onClose: EventEmitter<any> = new EventEmitter();

    public text: string;
    private keyListener: any;

    constructor() {
        this.keyListener = document.addEventListener('keyup', (event: KeyboardEvent) => {
            const key = event.which || event.keyCode;
            // enter to run accept()
            if (key === 13) {
                this.accept();
                document.removeEventListener('keydown', this.keyListener);
            }
        });
    }

    public ngOnInit() {
        if (!this.options.buttonLabels) {
            this.options.buttonLabels = {
                accept: 'Ok',
                cancel: 'Avbryt'
            };
        }
    }

    public ngAfterViewInit() {
        setTimeout(function() {
            if (document.getElementById('text_input')) {
                document.getElementById('text_input').focus();
            }
        });
    }

    accept() {
        this.onClose.emit(this.text);
    }

    close() {
        this.onClose.emit(null);
    }
}
