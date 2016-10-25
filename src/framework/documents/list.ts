import {Component, Input, Output, EventEmitter} from '@angular/core';
import {FileUploadService} from './FileUploadService';

@Component({
    selector: 'uni-document-list',
    template: `
        <ul>
            <li *ngFor="let slot of service.Slots">
                <a (click)="open(slot)">{{slot?.Name}}</a>
                <button (click)="delete(slot)">Delete</button>
            </li>
        </ul>
    `
})
export class UniDocumentList {

    @Input()
    public service: FileUploadService<any>;

    @Input()
    public entity: any;

    @Output()
    public clickItem: EventEmitter<any> = new EventEmitter<any>(true);

    @Output()
    public deleteItem: EventEmitter<any> = new EventEmitter<any>(true);

    constructor() {
    }

    public ngOnInit() {
        this.service.getSlots(this.entity.ID);
    }

    public open(slot) {
        var self = this;
        this.service.download(this.entity.ID, slot.ID)
            .then((response) => {
                self.clickItem.emit(response);
            });
    }

    public delete(slot) {
        var self = this;
        this.service.remove(this.entity.ID, slot)
            .then((response) => {
                self.deleteItem.emit(response);
            });
    }
}
