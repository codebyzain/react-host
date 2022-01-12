# react-host

This is a node js server that allows you to host a react js or any static website with helpfull feature such as Over-The-Air update using REST api


## How to use

1. Clone this repository to your machine
2. In root folder run `node index.js`, it will display some info like port, build token, direcotry and site status which you can change in `global.json` file
3. There are two ways you can deploy your site

### Manual Deployment

After you build your react js project into static folder. upload `build` folder from your project to the root folder in react-host. your website should automatically run after refresh. note that you have to manually replace build folder everytime you have an update.

### OTA (Over-The-Air) Deployment

This is one of the most useful feature of this framework, it enables you to push your new build to the server without copy paste in your server. 

1. Compress your `build` folder into a zip. 
2. Change `ota` setting in `global.json` and set it to `true`
3. Use postman or if you have your own REST api caller. and call `YOUR_DOMAIN/--build/push` with POST method, contain `file` as the body request and upload your zipped file there, dont forget to set `x-body-token` in your request header.
4. Your build should automatically runs.
