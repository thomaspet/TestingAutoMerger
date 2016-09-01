import { Component, ComponentRef, ViewChild, ViewContainerRef, ComponentFactory } from '@angular/core';
import { ComponentCreator } from '../../../../framework/core/dynamic/index';
import { AppModule } from '../../../bootstrap';
import { UniTestComponent } from './testComponent';

@Component({
    selector: 'uni-dynamic-demo',
    template: `
        <button type="button" (click)="create()">Create!</button>
        <button type="modify" (click)="modify()" [disabled]="!component">Modify!</button>
        <button type="button" (click)="destroy()" [disabled]="!component">Destroy!</button>
        <div #dynamicContentPlaceHolder></div>
        <p>Status: {{status}}</p>
    `,
    providers: [ComponentCreator]
})
export class UniDynamicDemo {

    @ViewChild('dynamicContentPlaceHolder', {read: ViewContainerRef})
    public target: ViewContainerRef;

    public component: ComponentRef<UniTestComponent>;
    public factory: ComponentFactory<UniTestComponent>;
    public status: string = 'Component is not created!';

    constructor(public creator: ComponentCreator<UniTestComponent>) {
        this.factory = this.creator.compileComponent<UniTestComponent>(UniTestComponent, AppModule);
    }

    public create() {
        this.component = this.creator.attachComponentTo(this.target, this.factory, {
            inputs: {
                myInput: this.status
            },
            outputs: {
                onReady: function(isReady) {
                    if (isReady) {
                        this.status = 'Component is ready!';
                    }
                    console.log(this);
                }.bind(this),
                onChange: function(value) {
                    this.status = value;
                }.bind(this)
            }
        });
    }

    public modify() {
        if (this.component) {
            this.component.instance.myInput = 'The input is modified!';
            this.component.instance.update();
            this.status = 'Component is modified';
        }
    }

    public destroy() {
        if (this.component) {
            this.component.destroy();
            this.status = 'Component is destroyed';
            this.component = null;
        }
    }
}
