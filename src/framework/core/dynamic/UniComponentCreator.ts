import {
    Injectable,
    ViewContainerRef,
    ComponentRef,
    ComponentFactory
} from '@angular/core';
import { RuntimeCompiler } from '@angular/compiler';
import { AppModule } from '../../../app/bootstrap';
import {IUniInputsAndOutputs} from './UniDynamic';

@Injectable()
export class ComponentCreator<T> {
    constructor(public compiler: RuntimeCompiler) {}

    public compileComponent<T>(component, module): ComponentFactory<T> {
        module = module || AppModule;
        return <ComponentFactory<T>>this.compiler.compileComponentSync(component, module);
    }

    public attachComponentTo<T>(anchor: ViewContainerRef, factory: ComponentFactory<T>, inputsAndOutputs: IUniInputsAndOutputs) {
        let reference;
        // our component will be inserted after #dynamicContentPlaceHolder
        reference = anchor.createComponent(factory, 0);

        // and here we have access to our dynamic component
        let instance: T = reference.instance;
        let inputs = Object.keys(inputsAndOutputs.inputs || {});
        inputs.forEach((input) => {
            instance[input] = inputsAndOutputs.inputs[input];
        });

        let outputs = Object.keys(inputsAndOutputs.outputs || {});
        outputs.forEach((output) => {
            instance[output].subscribe(inputsAndOutputs.outputs[output]);
        });
        return reference;
    }
}
