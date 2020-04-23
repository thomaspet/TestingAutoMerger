import {Directive, Input, TemplateRef, ViewContainerRef} from '@angular/core';
import {FeaturePermissionService} from '@app/featurePermissionService';

@Directive({
  selector: '[ifFeaturePermission]'
})
export class FeaturePermissionDirective {

    constructor(
        private featurePermissionService: FeaturePermissionService,
        private templateRef: TemplateRef<any>,
        private viewContainer: ViewContainerRef
    ) {}

    @Input()
    set ifFeaturePermission(feature: string) {
        console.log('directive', feature);
        if (this.featurePermissionService.canShowUiFeature(feature)) {
            this.viewContainer.createEmbeddedView(this.templateRef);
        } else {
            this.viewContainer.clear();
        }
    }
}
