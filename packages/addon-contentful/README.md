# `@vuesion/addon-contentful`

> contentful integration for the [vue-starter project](https://github.com/devCrossNet/vue-starter)

# Installation

Inside your vue-starter project run:

```js
npm run add
```

# Create Contentful Models

## Page

![page model](page.png?raw=true)

## Text

![page model](text.png?raw=true)

## Gallery

![page model](gallery.png?raw=true)

# Create Content

## Test Page

![page model](testpage.png?raw=true)

## Notfound Page

![page model](notfound.png?raw=true)

# Testing

- run your app `CONTENTFUL_ACCESS_TOKEN=your-token CONTENTFUL_SPACE_ID=your-space-id npm run dev`
- go to [http://localhost:3000/test](http://localhost:3000/test)
  - you should see the content from contentful
- go to [http://localhost:3000/foo](http://localhost:3000/foo)
- you should get a 404 error in the network tab and the content from contentful

# Next steps

- create more content models and refine the logic in the contentful module e.g. use `<component :is="item.component" v-bind="item.properties" />`
