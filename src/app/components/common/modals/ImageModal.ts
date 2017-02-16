import {Component, Type, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {UniModal} from '../../../../framework/modals/modal';
import {File} from '../../../unientities';
import {UniImage} from '../../../../framework/uniImage/uniImage';


type Config = {
    close: () => void,
    entity: string,
    entityID: number,
    showFileID: Number,
    readOnly: boolean,
    event: (files: File[]) => void
}

export type UpdatedFileListEvent = {
    entity: string, 
    entityID: number, 
    files: File[]
}

@Component({
    selector: 'image-modal-content',
    template: `
        <article class="modal-content" [attr.aria-busy]="busy">
            <article class="image-modal">
                <uni-image 
                    [entity]="config.entity" 
                    [entityID]="config.entityID"
                    [showFileID]="config.showFileID"
                    [readonly]="config.readOnly"
                    (fileListReady)="config.event($event)"
                ></uni-image>
            </article>
        </article>`
})
export class ImageModalContent {
    @Input()
    public config: Config;

    @ViewChild(UniImage) public uniImage: UniImage;
}

@Component({
    selector: 'image-modal',
    template: '<uni-modal [type]="type" [config]="config"></uni-modal>'
})
export class ImageModal {
    public config: Config;
    public type: Type<any> = ImageModalContent;

    @ViewChild(UniModal)
    private modal: UniModal;

    @Output()
    public updatedFileList: EventEmitter<UpdatedFileListEvent> = new EventEmitter<UpdatedFileListEvent>();

    constructor() {
        this.config = <Config>{
            close: () => {
                this.modal.getContent().then((component: ImageModalContent) => {
                    this.modal.close();
                });
            },
            event: (files: File[]) => this.fileListReady(files)
        };
    }

    public open(entity: string, entityID: number, showFileID: number = null) {
        this.modal.open();
        this.config.entity = entity;
        this.config.entityID = entityID;
        this.config.showFileID = showFileID;
        this.config.readOnly = false;
    }

    public openReadOnly(entity: string, entityID: number, showFileID: number = null) {
        this.modal.open();
        this.config.entity = entity;
        this.config.entityID = entityID;
        this.config.showFileID = showFileID;
        this.config.readOnly = true;
    }

    public refreshImages() {
        this.modal.getContent().then((component: ImageModalContent) => {
            component.uniImage.refreshFiles();
        });
    }

    private fileListReady(files: File[]) {
        this.updatedFileList.emit({entity: this.config.entity, entityID: this.config.entityID, files: files});
    }
}
