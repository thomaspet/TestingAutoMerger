/// <reference path="../../../typings/systemjs/systemjs.d.ts" />
export class ComponentProxy {

    static LoadComponentAsync(name,path){
        if (!window.TEST_MODE) {
            return System.import(path)
                .then(c => c[name]);
        } else {
            var newpath = path.replace('.',"./src");
            return System.import(newpath).then(c => c[name]);
        }
    }

}