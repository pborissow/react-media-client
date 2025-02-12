# React Media Client
Web frontend used to view and manage photos and videos. Requires a media server on the backend (e.g. javaxt-media-server).


## NPM Quickstart
Clone this repo, cd into the directory and run the following:
```
npm start
```
Note that you must have javaxt-media-server up and running on port 8080. Example:
```
java -jar media-server.jar -port 8080
```


## Routing
Updated `package.json` by adding the following line to point to the media server:
```
  "proxy": "http://localhost:8080",
```


## Dependencies

### Font Awesome
Font Awesome is used for icons. The icons are defined in CSS (vs inline JavaScript/JSX). A static bundle was downloaded and put in the `public/lib` directory and an include to the stylesheet was added to `index.html`.

Note that the official guidance for React users is to add FontAwesome is like this:
```
npm i --save @fortawesome/fontawesome-svg-core
npm i --save @fortawesome/free-solid-svg-icons
npm i --save @fortawesome/free-regular-svg-icons
npm i --save @fortawesome/free-brands-svg-icons
```
However, after adding these includes, I couldn't figure out how to use FontAwesome as psuedo elements in css. So for now, we're using the static bundle in the `public/lib` directory.


### Material UI
Material UI is used to create buttons, sliders, grid, etc.
```
npm install @mui/material @emotion/react @emotion/styled
npm install @fontsource/roboto
npm install @mui/icons-material
```

### React Window
React Window is used for infinite scroll.
```
npm install --save react-window
npm install --save react-window-infinite-loader
```

### Misc
This app was created using `create-react-app` which installed over 800 different packages. I have no idea which ones are actually used to run this app above and beyond what's defined in the `package.json` file.