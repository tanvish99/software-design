# 1. Stage 1: Build Angular App
FROM node:22-bookworm AS build

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and package-lock.json
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy the rest of the application
COPY . .

# 6. Build the Angular app
RUN npm run build

# 7. Stage 2: Serve Angular App with Nginx
FROM nginx:stable

# 8. Copy the build output to Nginx's html directory
COPY --from=build /app/dist/example-app /usr/share/nginx/html

# 9. Copy custom nginx configuration file if you have one
COPY nginx.conf  /etc/nginx/conf.d/default.conf

# 10. Expose port 80
EXPOSE 80

RUN apt-get update && apt-get install -y curl jq

# 11. Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
#test