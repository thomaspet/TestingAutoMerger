import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {FlowInput} from '@app/components/admin/flow/templates';
import {AuthService} from '@app/authService';

@Component({
    selector: 'flow-generic-input-modal',
    template: `
        <section role="dialog" class="uni-modal uni-redesign">
            <header>{{options.header}}</header>
            <article>
                <section class="input-item" *ngFor="let input of flowInputs">
                    <mat-form-field>
                        <input type="text"
                               autofocus
                               name="eventplan-name"
                               [(ngModel)]="input.Value"
                               [placeholder]="input.Label.no"
                               aria-label="Text"
                               matInput
                               style="border:none;">
                    </mat-form-field>
                    <mat-error *ngIf="validate(input)">{{validate(input)}}</mat-error>
                </section>
            </article>
            <footer class="center">
                <button class="rounded"
                        (click)="close()">
                    Avbryt
                </button>
                <button class="c2a rounded"
                        (click)="save()">
                    OK
                </button>
            </footer>
        </section>
    `,
    styleUrls: ['./flowGenericInputModal.sass']
})
export class FlowGenericInputModal implements IUniModal, OnInit {
    @Input()
    options: IModalOptions = {};

    @Output()
    onClose: EventEmitter<FlowInput[]> = new EventEmitter<FlowInput[]>();

    flowInputs: FlowInput[];

    constructor(
        private authService: AuthService,
    ) {}

    ngOnInit() {
        this.flowInputs = this.options.data.map((input: FlowInput) => {
            if (input.DefaultValue === '@@user_email') {
                input.Value = this.authService.currentUser.Email
            } else {
                input.Value = input.DefaultValue;
            }
            return input;
        });
    }

    close() {
        this.onClose.emit(null);
    }

    save() {
        const allInputsAreValid = this.flowInputs.every(input => !this.validate(input));
        if (allInputsAreValid) {
            this.onClose.emit(this.flowInputs);
        }
    }

    validate(input: FlowInput): string {
        if (!input.Value) {
            return 'Kan ikke være tom';
        }
        if (input.Type === "Email" && !input.Value.includes('@')) {
            return 'Må være gyldig e-mail';
        }
        if (input.Type === 'integer' && isNaN(input.Value)) {
            return 'Må være tall';
        }
        return '';
    }
}
