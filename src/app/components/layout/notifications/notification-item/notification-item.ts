import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {Notification} from '@uni-entities';
import * as moment from 'moment';
import { EntitytypeTranslationPipe } from '@uni-framework/pipes/entitytype-translation.pipe';

@Component({
    selector: 'notification-item',
    templateUrl: './notification-item.html',
    styleUrls: ['./notification-item.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotificationItem {
    @Input() notification: Notification;

    notificationType: 'approval' | 'inbox' | 'mention' | 'reminder';
    notificationText: string;
    icon: string;
    timestamp: string;
    hasHtml = false;

    constructor(private entitytypeTranslationPipe: EntitytypeTranslationPipe) {}

    ngOnChanges() {
        if (this.notification) {
            const sourceEntityType = this.notification.SourceEntityType;
            const sourceEntityID = this.notification.SourceEntityID;
            const entityType = this.notification.EntityType;
            const entityID = this.notification.EntityID;

            if (sourceEntityType === 'Comment') {
                this.notificationType = 'mention';
                this.notificationText = `Du har blitt nevnt i en kommentar på ${this.entitytypeTranslationPipe
                    .transform(entityType)} ID ${entityID}`;
                this.icon = 'comment';
            }

            if (sourceEntityType === 'File') {
                this.notificationType = 'inbox';
                this.icon = 'description';

                if (this.notification['_count'] > 1) {
                    this.notificationText = `${this.notification['_count']} nye dokumenter i innboks`;
                } else {
                    this.notificationText = `Nytt dokument i innboks`;
                }
            }

            if (entityType === 'Approval') {
                this.notificationType = 'approval';
                this.notificationText = `Du har blitt bedt om å godkjenne ${this.entitytypeTranslationPipe
                    .transform(sourceEntityType)} ID ${sourceEntityID}`;
                this.icon = 'assignment_turned_in'; // 'thumb_up_alt';
            } else if (entityType === 'CustomerInvoiceReminder') {
                this.notificationType = 'reminder';
                this.icon = 'alarm';
                this.notificationText = this.notification.Message;
                if (!this.notification.Message) {
                    this.notificationText = 'Faktura er klar til inkasso';
                }
            } else if (entityType === 'ApiKey') {
                this.notificationType = 'inbox';
                this.icon = 'info';
                if (this.notification.Message.indexOf('<') !== -1 && this.notification.Message.indexOf('>') !== -1) {
                    this.hasHtml = true;
                }
            }

            // All Contract varsler (iallefall i dev) er feilmeldinger, som ikke er relevante for brukeren.
            if (!this.notificationText && this.notification.Message
                && this.notification.EntityType !== 'Contract') {
                this.notificationText = this.notification.Message;
            }

            const createdAt = moment(this.notification.CreatedAt);
            if (createdAt.isValid()) {
                this.timestamp = createdAt.fromNow();
            }
        }
    }
}
