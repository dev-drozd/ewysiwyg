# EWysiwyg
EWysiwyg the very lightweight and extensible wysiwyg editor:

[Live demo](https://dev-drozd.github.io/ewysiwyg/ "Show demo")

[![Preview](https://github.com/dev-drozd/ewysiwyg/blob/main/image.jpg?raw=true "Preview")](https://dev-drozd.github.io/ewysiwyg/ "Preview")

### Installation:
To install EWySiWyg on a website, you need to add the following lines between the `<head>` tags:

```html
<link rel="stylesheet" href="css/EWySiWyg.css">
<script src="js/EWySiWyg.min.js"></script>
```
### Initialization:
To get the initialization:
```javascript
$("textarea").EWySiWyg();
```
### Expansion
To write your own plugin for EWySiWyg:
```javascript
$.EWySiWyg.methods = function(){
    return this;
};
```
### Donate the project:
If you like this project, you can support the author so that he can continue to develop:
1. Revolut: [Donate Revolut](https://revolut.me/devdrozd "Donate Revolut")
2. PayPal: [Donate PayPal](https://www.paypal.com/donate/?hosted_button_id=UQGNYDVPER2TJ "Donate PayPal")
3. PrivatBank: **4149 6293 3157 1273**


[![Donate](https://www.paypalobjects.com/en_US/i/btn/btn_donateCC_LG.gif "Donate")](https://www.paypal.com/donate/?hosted_button_id=UQGNYDVPER2TJ "Donate")
