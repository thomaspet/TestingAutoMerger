import {CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/common';
import {Component, Input, Output, EventEmitter} from 'angular2/core';
import {FileUploadService} from './FileUploadService';

@Component({
    selector: 'uni-document-list',
    directives: [CORE_DIRECTIVES, FORM_DIRECTIVES],
    template: `
        <ul *ngIf="service.Slots">
            <li *ngFor="#slot of service.Slots">
                <a (click)="open(slot)">{{slot.Name}}</a>
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
    public onClickItem: EventEmitter<any> = new EventEmitter<any>(true);

    constructor() {
    }

    public ngOnInit() {
        this.service.getSlots(this.entity.ID);
    }

    public open(slot) {
        var self = this;
        this.service.download(this.entity.ID, slot.ID)
            .subscribe((response) => {
                self.onClickItem.emit(response);
            });
    }

    public delete(slot) {
        this.service.remove(this.entity.ID, slot);
    }
}