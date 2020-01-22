import {Component, Input, Output, EventEmitter} from '@angular/core';
import {IUniModal, IModalOptions, ConfirmActions} from '@uni-framework/uni-modal/interfaces';


@Component({
    selector: 'uni-checkbox-confirm-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign uni-confirm-with-checkbox-modal">
            <header>{{options.header}}</header>

            <article>
                <div class="warning-container" *ngIf="options.warning">
                    <i class="material-icons">info</i>
                    <p class="warn" [innerHtml]="options.warning"></p>
                </div>

                <section [innerHtml]="options.message"></section>

                <mat-checkbox
                    *ngIf="options?.checkboxLabel"
                    [(ngModel)]="hasConfirmed">
                    {{ options.checkboxLabel }}
                </mat-checkbox>
            </article>

            <footer>
                <button *ngIf="options.buttonLabels.accept"
                    class="good"
                    id="good_button_ok"
                    (click)="accept()"
                    [disabled]="!hasConfirmed && options?.checkboxLabel">

                    {{options.buttonLabels.accept}}
                </button>

                <button *ngIf="options.buttonLabels.reject"
                    class="bad"
                    (click)="reject()"
                    [disabled]="!hasConfirmed && options?.checkboxLabel">

                    {{options.buttonLabels.reject}}
                </button>

                <button *ngIf="options.buttonLabels.cancel" class="cancel" (click)="cancel()">
                    {{options.buttonLabels.cancel}}
                </button>
            </footer>
        </section>
    `
})
export class UniConfirmModalWithCheckbox implements IUniModal {
    @Input()
    public options: IModalOptions = {};

    @Output()
    public onClose: EventEmitter<any> = new EventEmitter();

    hasConfirmed: boolean = false;

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
            if (document.getElementById('good_button_ok')) {
                document.getElementById('good_button_ok').focus();
            }
        });
    }

    public accept() {
        this.onClose.emit(ConfirmActions.ACCEPT);
    }

    public reject() {
        this.onClose.emit(ConfirmActions.REJECT);
    }

    public cancel() {
        this.onClose.emit(ConfirmActions.CANCEL);
    }
}
