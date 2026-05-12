FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# 프로덕션 빌드 (과제 완성도 떡상 포인트)
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
