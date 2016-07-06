import {Component} from "@angular/core";
import {View} from '../../../../models/view/view';
import {UniForm, UniFieldLayout} from '../../../../../framework/uniform';
import {createFormField} from '../../utils/utils';


export var view = new View('workprofile', 'Stillingsmal', 'WorkprofileDetailview', true);

@Component({
    selector: view.name,
    template: '<genericdetail [viewconfig]="viewconfig" ></genericdetail>',
    directives: []
})
export class WorktypeDetailview {
    constructor() {
    }
}