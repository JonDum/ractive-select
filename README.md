# ractive-select


A replacement for `<select>` tags that allows full styling and customizability.

### Demo

[Live Demo](http://jondum.github.com/ractive-select/demo/)

### Install


```
npm install ractive-select --save
```

### Usage

Add the select to your Ractive instance:

```
Ractive.extend({
    ...
    components: {
        select: require('ractive-select')
    },
    ...
});
```

Use it like a normal select element

```
<select value='{{ myValue }}'>
 {{#each options}}
 <option>{{this}}</option>
 {{/each}}
 <option>some other option</option>
</select>
```

