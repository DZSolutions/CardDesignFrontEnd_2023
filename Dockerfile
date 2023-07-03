# Name the node stage "builder"
FROM node:14-alpine as builder

# Set working directory
WORKDIR /app

# Copy all files from current directory to working dir in image
COPY . .

# install node modules and build assets
RUN npm config set user 0
RUN npm config set unsafe-perm true
RUN npm install -g npm@latest
RUN npm install
RUN chmod -R 777 node_modules/
RUN npm run-script build

# nginx state for serving content
FROM nginx:stable-alpine

# Set working directory to nginx asset directory
WORKDIR /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx static assets
RUN rm -rf ./*

# Copy static assets from builder stage
COPY --from=builder /app/public .

# Containers run nginx with global directives and daemon off
EXPOSE 80
ENTRYPOINT ["nginx","-g","daemon off;"]