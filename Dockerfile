# Nestjs Service Dockerfile
# Builder
FROM node:lts-alpine AS development

# 设置时区
RUN apk add tzdata

ENV CI=true \
    TZ='Asia/Shanghai'

WORKDIR /home/app

EXPOSE ${EXPOSE_PORT}

COPY --chown=node:node package.json pnpm-lock.yaml /home/app/

RUN npm install -g pnpm
RUN npm install -g cross-env

# 复制当前代码到/app工作目录
COPY --chown=node:node . /home/app

# project install 
# RUN npm ci 不用缓存策略ci
# RUN npm install
RUN pnpm install 

RUN mkdir -p /data/wgts/tmp

VOLUME [ "/data" ]

CMD [ "pnpm" , "start:dev" ]

##############################
# Builder
##############################
FROM development AS builder

# 打包
RUN pnpm run build

COPY --chown=node:node --from=gloursdocker/docker / /

CMD [ "pnpm" ,"start:prod"]

