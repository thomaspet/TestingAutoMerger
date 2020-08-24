import {Component, Input} from '@angular/core';
import {StatisticsService} from '@app/services/services';
import {StatusCodeSharing, SharingType} from '@uni-entities';

@Component({
    selector: 'toolbar-sharing-status',
    templateUrl: './sharing-status.html',
    styleUrls: ['./sharing-status.sass']
})
export class ToolbarSharingStatus {
    @Input() entityType: string;
    @Input() entityID: string;

    sharingHistory: any[];
    sharingStatusText: string;

    statusIndicator: {label: string; class?: string, icon?: string};

    constructor(private statisticsService: StatisticsService) {}

    ngOnChanges() {
        this.loadStatuses();
    }

    loadStatuses() {
        this.sharingHistory = undefined;
        this.sharingStatusText = undefined;
        this.statusIndicator = undefined;

        if (this.entityType && this.entityID) {
            const previousSharingsQuery = `model=Sharing`
                + `&filter=EntityType eq '${this.entityType}' and EntityID eq ${this.entityID}`
                + `&select=ID,Type,StatusCode,ExternalMessage,UpdatedAt,CreatedAt,To`;

            this.statisticsService.GetAllUnwrapped(previousSharingsQuery).subscribe(
                sharings => {
                    if (sharings && sharings.length) {
                        this.sharingHistory = sharings;

                        const nonPrintSharings = sharings.filter(s => s.SharingType !== SharingType.Print);
                        if (nonPrintSharings && nonPrintSharings.length) {
                            this.statusIndicator = this.getStatusIndicator(nonPrintSharings[nonPrintSharings.length - 1]);
                        } else {
                            this.statusIndicator = this.getStatusIndicator(sharings[sharings.length - 1]);
                        }
                    }
                },
                err => console.error(err)
            );
        }
    }

    private getStatusIndicator(sharing) {
        if (sharing.SharingType === SharingType.Print) {
            return {
                label: 'Skrevet ut',
                icon: 'print'
            };
        }

        if (sharing.SharingType === SharingType.Email && sharing.SharingStatusCode === StatusCodeSharing.Completed) {
            return {
                label: 'Sendt på epost',
                icon: 'email',
                class: 'good'
            };
        }

        switch (sharing.SharingStatusCode) {
            case StatusCodeSharing.Pending:
            case StatusCodeSharing.InProgress:
                return {
                    label: 'I utsendingskø',
                    icon: 'timelapse'
                };
            case StatusCodeSharing.Completed:
                return {
                    label: 'Utsending fullført',
                    class: 'good',
                    icon: 'check_circle'
                };
            case StatusCodeSharing.Cancelled:
                return {
                    label: 'Utsending avbrutt',
                    class: 'warn',
                    icon: 'error_outline'
                };
            case StatusCodeSharing.Failed:
                return {
                    label: 'Utsending feilet',
                    class: 'bad',
                    icon: 'error_outline'
                };
        }

        return;
    }

    getSharingText(sharing) {
        switch (sharing.SharingType) {
            case SharingType.Unknown:
                return 'Sending via utsendingsplan';
            case SharingType.Print:
                return 'Skrevet ut';
            case SharingType.Email:
                return `Sendt på epost`;
            case SharingType.AP:
                return 'Sending via aksesspunkt/EHF';
            case SharingType.Export:
                return 'Eksportert';
            case SharingType.InvoicePrint:
                return 'Fakturaprint (fra Nets)';
            case SharingType.Efaktura:
                return 'Sending via eFaktura';
            case SharingType.Avtalegiro:
                return 'Sending via avtalegiro';
            case SharingType.Factoring:
                return 'Factoring';
        }
    }

    getSharingStatus(sharing) {
        switch (sharing.SharingStatusCode) {
            case StatusCodeSharing.Pending:
            case StatusCodeSharing.InProgress:
                return 'Planlagt / i kø';
            // return 'Behandles';
            case StatusCodeSharing.Completed:
                return 'Fullført';
            case StatusCodeSharing.Cancelled:
                return 'Avbrutt';
            case StatusCodeSharing.Failed:
                return 'Feilet';
        }
    }
}
