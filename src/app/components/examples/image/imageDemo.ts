import {Component, ViewChildren, QueryList} from '@angular/core';
import {AsyncPipe} from '@angular/common';
import {UniImage, UniImageSize} from '../../../../framework/uniImage/uniImage';
import {Http, URLSearchParams} from '@angular/http';

@Component({
    selector: 'uni-image-demo',
    template: `    
        <uni-image [imageId]="imageId" [size]="imageSize"></uni-image>
    `,
    directives: [UniImage],
})
export class ImageDemo {
    
    private imageId: number;
    private imageSize: UniImageSize;

    ngOnInit() {
        // Kan også settes rett i markupen. Se utkommentert linje i template!
        // F.eks <uni-image [imageId]="4" [size]="150"></uni-image>
        // merk at dersom size settes rett i markup må den tilsvare verdien på et element i UniImageSize enum.
        // Size er forøvrig optional. Dersom denne ikke settes får man bildet i sin orginale oppløsning.
        this.imageId = 11;
        this.imageSize = UniImageSize.small;
    }

}
