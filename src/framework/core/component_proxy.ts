/// <reference path="../../../typings/systemjs/systemjs.d.ts" />

export class ComponentProxy {

    static LoadComponentAsync(name,path){
        return System.import(path).then(c => c[name]);
    }

}