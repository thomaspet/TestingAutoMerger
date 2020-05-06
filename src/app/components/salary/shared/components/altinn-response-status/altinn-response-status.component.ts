import {Component, OnInit, Input, OnChanges, SimpleChanges} from '@angular/core';

@Component({
    selector: 'uni-altinn-response-status',
    templateUrl: './altinn-response-status.component.html',
    styleUrls: ['./altinn-response-status.component.sass']
})
export class AltinnResponseStatusComponent implements OnInit, OnChanges {
    @Input() public status: any;
    public mainStatusLines: string[] = [];
    constructor() { }

    public ngOnInit() {
    }

    public ngOnChanges(changes: SimpleChanges) {
        if (!changes['status']) {
            return;
        }
        this.setMainStatus(changes['status'].currentValue);
    }

    private setMainStatus(status: any) {
        if (!status.mainStatus) {
            return;
        }
        this.mainStatusLines = status.mainStatus.split('\r\n');
    }

}
