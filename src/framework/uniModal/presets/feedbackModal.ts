import {Component, ViewChild, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {FormControl} from '@angular/forms';
import {UniHttp} from '../../core/http/http';
// import {ErrorService} from '../../../services/services';
import {IModalOptions, IUniModal} from '../modalService';
import {ToastService, ToastType, ToastTime} from '../../uniToast/toastService';

import * as moment from 'moment';
declare var APP_VERSION;

import {Observable} from 'rxjs/Observable';

@Component({
    selector: 'uni-feedback-modal',
    template: `
        <section role="dialog" class="uni-modal">
            <header>
                <h1>Gi tilbakemelding</h1>
            </header>

            <article>
                <p class="warn" *ngIf="errorMessage">{{errorMessage}}</p>
                <label>
                    Tittel
                    <input #title autocomplete="off" type="text" [formControl]="titleControl" placeholder="Tittel" id="feedback_title" />
                </label>

                <label>
                    Beskrivelse
                    <textarea #description [formControl]="descriptionControl" placeholder="Beskrivelse"></textarea>
                </label>
            </article>

            <footer>
                <button class="good"
                    [attr.aria-busy]="busy"
                    [disabled]="!title.value.length || !description.value.length || busy"
                    (click)="submitFeedback()">

                    Send
                </button>
                <button class="bad" (click)="close()">Avbryt</button>
            </footer>
        </section>
    `,
    styles: [`
        input {
            margin-bottom: 1rem;
        }

        .warn {
            margin-top: 0;
        }

        textarea {
            height: 20rem;
        }
    `]
})
export class UniFeedbackModal implements IUniModal {
    @ViewChild('title') private titleInput: ElementRef;
    @Input() public options: IModalOptions = {};
    @Output() public onClose: EventEmitter<any> = new EventEmitter();

    public busy: boolean;
    private errorMessage: string;
    private titleControl: FormControl;
    private descriptionControl: FormControl;

    constructor(
        private http: UniHttp,
        private toastService: ToastService
    ) {}

    public ngOnInit() {
        this.titleControl = new FormControl('');
        this.descriptionControl = new FormControl('');
    }

    public ngAfterViewInit() {
        if (this.titleInput) {
            this.titleInput.nativeElement.focus();
        }
    }

    public close() {
        this.onClose.emit();
    }

    public submitFeedback() {
        const path = window.location.hash || '';
        let modules;
        modules = path.split('/').filter((item) => {
            return item !== '' && item !== '#' && isNaN(parseInt(item, 10));
        });

        if (!modules || !modules.length) {
            modules = ['Dashboard'];
        }

        const body = {
            Title: this.titleControl.value,
            Description: this.descriptionControl.value,
            Modules: modules,
            Metadata: {
                AbsoluteUri: window.location.href,
                LocalTime: moment(new Date()).format('DD.MM.YYYY HH:mm'),
                GitRev: 'https://github.com/unimicro/AppFrontend/commit/' + APP_VERSION
            }
        };

        this.busy = true;
        this.http.asPOST()
            .usingIntegrationDomain()
            .withEndPoint('api/feedback')
            .withBody(body)
            .send()
            .finally(() => this.busy = false)
            .subscribe(
                res => {
                    this.toastService.addToast(
                        'Tilbakemelding registrert',
                        ToastType.good,
                        ToastTime.short,
                        'Takk for din tilbakemelding!'
                    );

                    this.close();
                },
                err => {
                    this.errorMessage = 'Noe gikk galt under sending. Vennligst prøv igjen';
                }
            );
    }
}
