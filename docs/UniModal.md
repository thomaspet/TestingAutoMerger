# UniModal

It displays a modal in the screen

## Inputs

A modal needs to inputs:

- Type: The class of the Component we want to load inside the modal
- Config: The configuration object

## How to create a modal

Declare the modal in the template: 

```html
<uni-modal [type]="type" [config]="config"></uni-modal>
```

Reference the modal in your component:

```ts
@ViewChild(UniModal)
modal: UniModal;
```

If you have more than one modal in the screen:

```ts
@ViewChildren(UniModal)
modals: QueryList<UniModal>;
```

Define the configuration object

```ts
this.config = {
    title: "Modal 1",
    value: "Initial value",
    hasCancelButton: true,
    cancel: () => {
        self.modals[0].close();
    },
    actions: [
        {
            text: "Accept",
            method: () => {
                self.modals[0].getContent().then((content)=>{
                    self.valueFromModal = content.tempValue;
                    content.tempValue = "";
                    self.modal.close();
                });
            }
        }
    ]
};
```

## How to open a modal

```ts
modal.open()
```

## How to close a modal

```ts
modal.close()
```
## How to get the component inside the modal

## How to open a modal

```ts
modal.getContent().then((component)=> {
    //accest to the component methos and properties
})
```