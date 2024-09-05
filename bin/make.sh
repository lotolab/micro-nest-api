#!/bin/bash 
basepath=$(cd `dirname $0`;pwd);
workspace=$(cd `dirname $0`;cd ..;pwd);

# docker container name wgts_client_apiv3
REPO_NAMESPACE=xyai
REPO_IMG_NAME=wgts_client_service
ENV_FILE=.env
REPO_HOST=ccr.ccs.tencentyun.com
REPO_NAME=
REPO_PW=
PUB_VERSION=latest
CUR_VERSION=$(cat "${workspace}/package.json" | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g')
CUR_VERSION=`echo $CUR_VERSION | xargs`
EC_CMD=

# echo original parameters=[$@]
# 整理参数
ARGS=$(getopt -o 'he:v::' --long 'help,env:,version::' -n "$0" -- "$@")

# 将规范化后的命令行参数分配至位置参数（$1,$2,...)
eval set -- "${ARGS}"

function source_env(){
  if [ ! -f ${workspace}/${ENV_FILE} ];then
    echo -e "\033[31mNot found ${ENV_FILE} file in ${workspace} :\n\033[0m"
    exit 1
  fi
  source ${workspace}/${ENV_FILE}
  echo -e "\033[32mENV: $REPO_IMG_NAME $CONTAINER_NAME $CUR_VERSION\033[0m"
}
source_env

function show_help() {
  echo -e "\033[31mCommands Help :\033[0m";
  echo -e "\033[35m$ make: make <options?> command.\033[0m";
  echo -e "\033[35m$ make -h or --help : help docs.\033[0m";
  echo -e "\033[35m$ make -e<env-file> or <--env=env-file> <command:build|b|push|p|workflow|w>\033[0m";
  echo -e "\033[35m$ make -v<publish-version> or <--version=publish-version> : set build image version.default latest\033[0m";
  echo -e "\033[34mCommand:\033[0m";
  echo -e "\033[33m\t build or b : build image for project.\033[0m";
  echo -e "\033[33m\t push or p : push image to remote repository.\033[0m";
  echo -e "\033[33m\t workflow or w : first build then push remote.\033[0m";
}

# 解析参数
while true ; do 
  # fetch first args,then use shift clear
  case "$1" in 
    # Has help
    -h|--help) show_help; shift ;exit 1;;
    # env-file
    -e|--env)
      case "$2" in 
        "") shift 2 ;;
        *) 
          if [[ "$2" =~ ^(.env)([\.a-zA-Z0-9_]+)?$ ]];then
            ENV_FILE=$2 ;
            source_env;
          else 
            echo -e "\033[31mEnv file name illegal.\033[0m";
            exit 1;
          fi
         shift 2 ;;
      esac ;;  
    -v|--version) 
      case "$2" in 
        "") shift 2 ;;
        *) 
          if [[ "$2" =~ ^([0-9]\.[0-9]\.[0-9]{1,3})$ || "$2" == latest ]];then 
            PUB_VERSION=$2
            echo -e "\033[32mENV [publish version: $PUB_VERSION ]\033[0m"
          else
            echo -e "\033[31mVersion arg illegal. $2 shuld x.x.x \n\033[0m"
          fi
          shift 2;;
      esac ;;      
    --) shift ; break ;;
    *) echo "Interanl error" ; exit 1 ;;
  esac 
done 

if [ "$1" != "" ];then
  if [[ "$1" =~ ^(build|b|push|p|workflow|w)$ ]];then
    EC_CMD=$1
  else
    echo -e "\033[31m请选择操作 build[b],push[p] or workflow[w]:first build then push.\033[0m"
    exit 0;
  fi
else
  show_help;
  exit 0;
fi

function login_repo(){
  # login 
  # echo -e "$REPO_HOST -u $REPO_NAME -p $REPO_PW"
  docker login $REPO_HOST -u $REPO_NAME -p $REPO_PW
}

function build_image(){
    echo -e "Build ${REPO_IMG_NAME} image begin..."
    docker build -t "${REPO_NAMESPACE}/${REPO_IMG_NAME}:${CUR_VERSION}" --build-arg EXPOSE_PORT=${EXPOSE_PORT} --build-arg PORT=${PORT} --no-cache -f ${workspace}/Dockerfile  ${workspace}
}

function push_image(){
  IMG_ID=$(docker images -q --filter "reference=${REPO_NAMESPACE}/${REPO_IMG_NAME}:${CUR_VERSION}")

  if [ -z $IMG_ID ];then
    echo -e "\033[31m image ${REPO_NAMESPACE}/${REPO_IMG_NAME}:${CUR_VERSION} unfund,please build first. \n\033[0m";
    exit 0
  fi

  PUSH_URL=${REPO_HOST}/${REPO_NAMESPACE}/${REPO_IMG_NAME}:${PUB_VERSION}
  TAG_IMG=${REPO_NAMESPACE}/${REPO_IMG_NAME}:${CUR_VERSION}
  
  # echo -e "\033[31mimage tag $TAG_IMG $PUSH_URL\033[0m"

  docker image tag  $TAG_IMG $PUSH_URL
  docker push ${PUSH_URL}    
}

# EC_CMD
if [[ $EC_CMD =~ ^(build|b)$ ]];then 
  build_image
  exit 0
elif [[ $EC_CMD =~ ^(push|p)$ ]];then
  login_repo
  push_image
  exit 0
elif [[ $EC_CMD =~ ^(workflow|w)$ ]];then 
  build_image
  login_repo
  push_image
  exit 0
else
  show_help
  exit 0 
fi