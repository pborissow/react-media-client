# React Media Client
Web frontend used to view and manage photos and videos. Requires a media server on the backend (e.g. javaxt-media-server).



## Routing
Updated `package.json` by adding the following line to point to the media server:
```
  "proxy": "http://localhost:8080",
```


## Dependencies

### Font Awesome

A static bundle was downloaded and put in the `public/lib` directory and an include to the stylesheet was added to `index.html`.

The official was to add FontAwesome is like this but I couldn't figure out how to use FontAwesome as psuedo elements in css.
```
npm i --save @fortawesome/fontawesome-svg-core
npm i --save @fortawesome/free-solid-svg-icons
npm i --save @fortawesome/free-regular-svg-icons
npm i --save @fortawesome/free-brands-svg-icons
```

### Material UI
```
npm install @mui/material @emotion/react @emotion/styled
npm install @fontsource/roboto
npm install @mui/icons-material
```

### Misc
This app was created using `create-react-app` which installed over 800 different packages. I have no idea which ones are actually used to run this app.