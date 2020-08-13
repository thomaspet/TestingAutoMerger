import {Component, OnInit, EventEmitter, Input, Output, OnChanges, SimpleChanges} from '@angular/core';
import {A07Response} from '@uni-entities';
import {BehaviorSubject} from 'rxjs';
import {IModalOptions, IUniModal} from '@uni-framework/uni-modal';
import {AltinnIntegrationService, ErrorService} from '@app/services/services';
import {Observable} from 'rxjs';

@Component({
    selector: 'uni-reconciliation-response-modal',
    templateUrl: './reconciliation-response-modal.component.html',
    styleUrls: ['./reconciliation-response-modal.component.sass']
})
export class ReconciliationResponseModalComponent implements OnInit, IUniModal {
    @Input() public options: IModalOptions;
    @Output() public onClose: EventEmitter<any> = new EventEmitter<any>();
    public a07Status$: BehaviorSubject<A07Response> = new BehaviorSubject(new A07Response());
    public header: string;
    public busy: boolean;
    constructor() {}

    public ngOnInit() {
        if (!this.options || !this.options.data) {
            return;
        }
        this.handleStatus(this.options.data);
    }

    private handleStatus(status: A07Response) {
        this.a07Status$.next(status);
        this.header = status.Title || 'Resultat';
        if (!(status.Data && status.Data.length) || !status.DataName) {
            return;
        }
        this.downloadFile(status);
    }

    private downloadFile(status: A07Response) {
        const a = document.createElement('a');
        const dataURI = `data:${status.DataType};base64,` + status.Data;
        a.href = dataURI;
        a['download'] = status.DataName;

        const e = document.createEvent('MouseEvents');
        e.initMouseEvent(
            'click', true, false, document.defaultView,
            0, 0, 0, 0, 0, false, false, false, false, 0, null
        );

        a.dispatchEvent(e);
        a.remove();
    }

    public close() {
        this.onClose.next();
    }
}
