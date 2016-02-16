import {UniFormBuilder} from '../../forms';
import {IFormBuilder,IFormBuilderCollection} from './../interfaces';

declare var _;

export class UniCardFormBuilder {
    forms:IFormBuilderCollection=[];
    classes = [];

    constructor() {}

    addForm(form:IFormBuilder) {
        this.forms.push(form);
        return this;
    }

    addForms(...forms:  Array<IFormBuilder>) {
        forms.forEach((form:IFormBuilder)=>{
            this.forms.push(form);
        });
        return this;
    }

    addClass(className:string, callback: boolean|((...params:Array<any>)=>boolean)) {
        this.classes[className] = callback;
        return this;
    }

    config() {
        return this.forms;
    }

    findForm(index:number):UniFormBuilder {
        var value: UniFormBuilder = undefined;
        this.forms.forEach((element:IFormBuilder)=>{
            if (element.formIndex === index && element instanceof UniFormBuilder) {
                value = element;
            }
        });
        return value;
    }
}
