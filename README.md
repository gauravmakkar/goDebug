# goDebug
Use this repository to debug your data displayed in webpage.

## Install
```
bower install goDebug
```

## Include in your index.html
```
<script type="text/javascript" src="bower_components/goDebug/goDebug.js"></script>
```
## Put attribute for the HTML element.
For Example:
```
<div debugInfo="This is the debug information">
   This is the body of this div
</div>
```

## Initialise the goDebug in your document's ready event.
For Example:
```
jQuery(document).ready(function(){
goDebug("d e b u g")
})
```
Here "d e b u g" is the pattern you want to use for your debug information to be displayed.

## goDebug In Action
* Press d e b u g in your active window of your webpage.
* Enjoy!


