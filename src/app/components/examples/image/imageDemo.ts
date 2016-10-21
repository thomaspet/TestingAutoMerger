import {Component} from '@angular/core';
import {UniImageSize, IUploadConfig} from '../../../../framework/uniImage/uniImage';

@Component({
    selector: 'uni-image-demo',
    template: `
        <uni-image style="width: 40%"
                   [entity]="entity"
                   [entityID]="entityID"
                   [size]="size"
                   [uploadConfig]="uploadConfig">
        </uni-image>
    `
})
export class ImageDemo {
    private entity: string = 'product';
    private entityID: number = 35;
    private size: UniImageSize = UniImageSize.medium;
    private uploadConfig: IUploadConfig;

    public ngOnInit() {
        this.uploadConfig = {
            isDisabled: false,
            disableMessage: 'Du får ikke laste opp bilder fordi jeg har bestemt det'
        };
    }
}
