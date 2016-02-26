# UniComponentLoader

It loads any component asynchronously

## Inputs

- type: Type of the element (i.e: UniForm)
- config: config that the element needs
- loader: how to initialize component inputs

# Declaring a dynamic component

To declare a component loader place we need to add that component to our template.

```
<uni-component-loader
    [type]="type"
    [config]="config"
    [loader]="loader">
    </uni-component-loader>
```

Remember that all inputs are optional so you can define component as:

```
<uni-component-loader></uni-component-loader>
```

In that case you need to create it programatically.

Remember component is ready in the `afterViewInit` hook.

```ts
@ViewChild(UniComponentLoader)
uniCmpLoader: UniComponentLoader;

afterViewInit() {
    var self = this;
    self.uniCmpLoader.load(UniForm).then((cmp: ComponentRef) => {
        //inside `this` points to window
        cmp.instance.config = self.form;
        setTimeout(() => {
            self.formInstance = cmp.instance;
            console.log(self.formInstance);
        }, 100);
    });
}
```
