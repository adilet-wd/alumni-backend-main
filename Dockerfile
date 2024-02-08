FROM node:lts-alpine
WORKDIR ./src
ADD package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
RUN npx tsc
RUN mkdir "./dist/images"
RUN mkdir "./dist/images/avatars"
RUN mkdir "./dist/images/newsImages"
RUN mkdir "./dist/images/posters"
CMD [ "node", "./dist/entry-point/main.js"]