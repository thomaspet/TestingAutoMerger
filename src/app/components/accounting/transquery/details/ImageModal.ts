import {Component, Type, ViewChild, Input} from '@angular/core';
import {UniModal} from '../../../../../framework/modals/modal';

@Component({
    selector: 'image-modal-content',
    template: `
        <article class="modal-content" [attr.aria-busy]="busy">
            <article class="image-modal">
                <uni-image [entity]="config.entity" [entityID]="config.entityID"></uni-image>
            </article>
        </article>`
})
export class ImageModalContent {
    @Input()
    public config: { close: () => void, entity: string, entityID: number };
}

@Component({
    selector: 'image-modal',
    template: '<uni-modal [type]="type" [config]="config"></uni-modal>'
})
export class ImageModal {
    public config: { close: () => void, entity: string, entityID: number };
    public type: Type<any> = ImageModalContent;

    @ViewChild(UniModal)
    private modal: UniModal;

    constructor() {
        this.config = {
            close: () => {
                this.modal.getContent().then((component: ImageModalContent) => {
                    this.modal.close();
                });
            },
            entity: null,
            entityID: null
        };
    }

    public open(entity: string, entityID: number) {
        this.modal.open();
        this.config.entity = entity;
        this.config.entityID = entityID;
    }
}
