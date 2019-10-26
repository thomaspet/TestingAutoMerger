import {Component, Input} from '@angular/core';
import {StatisticsService} from '@app/services/services';
import {StatusCodeSharing} from '@uni-entities';

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

    statusIndicator: {label: string; class: string};

    constructor(private statisticsService: StatisticsService) {}

    ngOnChanges() {
        if (this.entityType && this.entityID) {
            const previousSharingsQuery = `model=Sharing`
                + `&filter=EntityType eq '${this.entityType}' and EntityID eq ${this.entityID}`
                + `&select=ID,Type,StatusCode,ExternalMessage,UpdatedAt,CreatedAt,To`;

            this.statisticsService.GetAllUnwrapped(previousSharingsQuery).subscribe(
                sharings => {
                    if (sharings && sharings.length) {
                        this.sharingHistory = sharings;
                        this.statusIndicator = this.getStatusIndicator(sharings[sharings.length - 1]);
                    }
                },
                err => console.error(err)
            );
        }
    }

    private getStatusIndicator(sharing) {
        console.log(sharing);
        switch (sharing.SharingStatusCode) {
            case StatusCodeSharing.Pending:
                return {
                    label: 'Utsending planlagt / i kø',
                    class: ''
                };
            case StatusCodeSharing.InProgress:
                return {
                    label: 'Utsending behandles',
                    class: ''
                };
            case StatusCodeSharing.Completed:
                return {
                    label: 'Utsending fullført',
                    class: 'good'
                };
            case StatusCodeSharing.Cancelled:
                return {
                    label: 'Utsending avbrutt',
                    class: 'warn'
                };
            case StatusCodeSharing.Failed:
                return {
                    label: 'Utsending feilet',
                    class: 'bad'
                };
        }

        return;
    }


}
