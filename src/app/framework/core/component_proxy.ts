import {Component, View, DynamicComponentLoader, Injector, bind, Type, ElementRef} from 'angular2/angular2';

export class ComponentProvider {
    path:string;
    provide:{(module:any):any};
}

export function componentProxyFactory(provider:ComponentProvider):any {
    @Component({
        selector: 'component-proxy',
        bindings: [bind(ComponentProvider).toValue(provider)]
    })
    @View({
        template: `<span #content/>`
    })
    class VirtualComponent {
        constructor(
            el: ElementRef,
            loader:DynamicComponentLoader,
            inj:Injector,
            provider:ComponentProvider) {
            System.import(provider.path)
                .then(m => {
                    loader.loadIntoLocation(provider.provide(m), el, 'content');
                });
        }
    }

    return VirtualComponent;
}