import {Component, Input, Output, EventEmitter, OnInit} from '@angular/core';
import {IUniModal, IModalOptions} from '@uni-framework/uni-modal';
import {cloneDeep} from 'lodash';

@Component({
    selector: 'smart-booking-settings-modal',
    template: `
        <section role="dialog" class="uni-modal" style="width: 30rem">
            <header>Innstillinger for smart bokføring</header>

            <article *ngIf="settings">
                <mat-checkbox [(ngModel)]="settings.turnOnSmartBooking">
                    Kjør smart bokføring automatisk
                </mat-checkbox>

                <mat-checkbox [(ngModel)]="settings.showNotification">
                    Vis varsler fra smart bokføring
                </mat-checkbox>
            </article>

            <footer>
                <button class="secondary" (click)="onClose.emit()">Avbryt</button>
                <button class="c2a" (click)="onClose.emit(settings)">Lagre</button>
            </footer>
        </section>
    `
})

export class UniSmartBookingSettingsModal implements OnInit, IUniModal {
    @Input() options: IModalOptions;
    @Output() onClose = new EventEmitter();

    settings;

    ngOnInit() {
        this.settings = cloneDeep(this.options.data.settings) || {};
    }
}
