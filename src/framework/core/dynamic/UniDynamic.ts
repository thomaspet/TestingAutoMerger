import {ChangeDetectorRef} from '@angular/core';

export interface IUniInputsAndOutputs {
    inputs?: any;
    outputs?: any;
}

export interface IUniDynamic {
    changeDetector: ChangeDetectorRef;
    update();
}

export class UniDynamic implements IUniDynamic {
    constructor(public changeDetector: ChangeDetectorRef) {

    }
    public update() {
        this.changeDetector.markForCheck();
    }
}

