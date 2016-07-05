import {Component} from "@angular/core";
import {RouteConfig, RouteDefinition, ROUTER_DIRECTIVES, AsyncRoute} from "@angular/router-deprecated";
import {ComponentProxy} from '../../../framework/core/componentProxy';

import {UniTabs} from "../layout/uniTabs/uniTabs";
import {UniFormDemo} from "./form/formDemo";
import {XFormDemo} from "./form/xFormDemo";
import {UniTableDemo} from "./table/tableDemo";
import {UniTableDemoNew} from './table/tableDemoNew';
import {UniTreelistDemo} from "./treelist/treelistDemo";
import {UniModalDemo} from "./modal/modalDemo";
import {UniModalAdvancedDemo} from "./modal/advancedDemo";
import {UniDocumentDemo} from "./documents/document";
import {UniSaveDemo} from "./save/saveDemo";
import {ImageDemo} from './image/imageDemo';

const CHILD_ROUTES = [
    new AsyncRoute({
        path: '/form',
        name: 'UniFormDemo',
        loader: () => ComponentProxy.LoadComponentAsync('UniFromDemo', 'app/components/examples/form/formDemo')
    }),
    new AsyncRoute({
        path: '/xform',
        name: 'XFormDemo',
        loader: () => ComponentProxy.LoadComponentAsync('XFormDemo', 'app/components/examples/form/xFormDemo')
    }),
    new AsyncRoute({
        useAsDefault: true,
        path: '/tablenew',
        name: 'UniTableDemoNew',
        loader: () => ComponentProxy.LoadComponentAsync('UniTableDemoNew', 'app/components/examples/table/tableDemoNew')
    }),
    new AsyncRoute({
        path: '/image',
        name: 'ImageDemo',
        loader: () => ComponentProxy.LoadComponentAsync('ImageDemo', 'app/components/examples/image/imageDemo')
    }),
    new AsyncRoute({
        path: '/modal',
        name: 'UniModalDemo',
        loader: () => ComponentProxy.LoadComponentAsync('UniModalDemo', 'app/components/examples/modal/modalDemo')
    }),
    new AsyncRoute({
        path: '/modal-advanced',
        name: 'UniModalAdvancedDemo',
        loader: () => ComponentProxy.LoadComponentAsync('UniModalAdvancedDemo', 'app/components/examples/modal/advancedDemo')
    }),
    new AsyncRoute({
        path: '/documents',
        name: 'UniDocumentDemo',
        loader: () => ComponentProxy.LoadComponentAsync('UniDocumentDemo', 'app/components/examples/documents/document')
    }),
    new AsyncRoute({
        path: '/save',
        name: 'UniSaveDemo',
        loader: () => ComponentProxy.LoadComponentAsync('UniSaveDemo', 'app/components/examples/save/saveDemo')
    }),
    new AsyncRoute({
        path: '/toast',
        name: 'UniToastDemo',
        loader: () => ComponentProxy.LoadComponentAsync('UniToastDemo', 'app/components/examples/toast/toastDemo')
    })
];

@RouteConfig(CHILD_ROUTES)
@Component({
    selector: 'uni-examples',
    template: `
        <h3>Demo of front-end components</h3>
        <uni-tabs [routes]="childRoutes" class="horizontal_nav"></uni-tabs>
        <router-outlet></router-outlet>
    `,
    directives: [ROUTER_DIRECTIVES, UniTabs]
})
export class Examples {
    private childRoutes: RouteDefinition[] = CHILD_ROUTES;
}
