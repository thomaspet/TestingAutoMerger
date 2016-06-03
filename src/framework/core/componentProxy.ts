/// <reference path="../../../typings/systemjs/systemjs.d.ts" />
declare var window;

export class ComponentProxy {

    static LoadComponentAsync(name,path){
        return System.import(path)
            .then(c => {
                return c[name]
            });
    }

}