FROM node AS compile-image

LABEL maintainer="post@unimicro.no"
WORKDIR /appfrontend
COPY package.json ./

RUN npm i
COPY . ./

RUN npm run build.prod

#FROM alpine
FROM nginx

COPY --from=compile-image appfrontend/dist  /usr/share/nginx/html

