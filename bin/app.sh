#!/bin/bash ENV_FILE
basepath=$(cd `dirname $0`;pwd);
workspace=$(cd `dirname $0`;cd ..;pwd);

# Constants
compose_file=docker-compose.yml
PORT=9008
# Env
REPO_NAMESPACE=xyai
REPO_IMG_NAME=wgts_client_service
ENV_FILE=.env
REPO_HOST=ccr.ccs.tencentyun.com
REPO_NAME=
REPO_PW=
PUB_VERSION=latest
MNT_CONF_VOL=/wgts/client_v3/.conf
MNT_DATA_VOL=/data/wgts_client
CONTAINER_NAME=wgts_client_apiv3
ASSIGN_CONTAINER_NAME=
DEPLOY_LOCAL=false
FORCE_RMI=false

# reset env
IMAGE_NAME=
DATA_VOL=
MNT_VOL=
EC_CMD=

# rebuild args
ARGS=$(getopt -o 'he:lm:n:v::' --long 'help,env:,local,mount:,name:,version::' -n "$0" -- "$@")

# 将规范化后的命令行参数分配至位置参数（$1,$2,...)
eval set -- "${ARGS}"

# Command pull|up|down|remove|rmi|stop|start|restart
function show_help() {
  echo -e "\033[31mCommands Help :\n\033[0m";
  echo -e "\033[35m$ app.sh <options?> <command>\033[0m";
  echo -e "\033[34m app.sh options: \033[0m ";
  echo -e "\033[35m app.sh -e<env-file> or <--env=env-file>: use env file.\033[0m";  
  echo -e "\033[33m\t-v<version> or --version=<version> : image version.\033[0m";
  echo -e "\033[33m\t-m<mount_volume> or --mount=<mount_volume> : up or down mount volumes.\033[0m";
  echo -e "\033[33m\t-n<container_name> or --name=<container_name> : set container_name.\033[0m";
  echo -e "\033[33m\t-l or --local : use local image name.\033[0m";
  echo -e "\033[34m\nCommand:\033[0m";
  echo -e "\033[33m\t pull or p : pull image from remote.\033[0m";
  echo -e "\033[33m\t up or u : deploy a container instance.\033[0m";
  echo -e "\033[33m\t down or d : remove a container instance.\033[0m";
  echo -e "\033[33m\t rmi : remove a container instance and image.\033[0m";
  echo -e "\033[33m\t start,stop or restart : start,stop or restart a container instance.\033[0m";
}

function source_env(){
  if [ ! -f ${workspace}/${ENV_FILE} ];then
    echo -e "\033[31mNot found ${ENV_FILE} file in ${workspace} :\n\033[0m"
    exit 1
  fi
  source ${workspace}/${ENV_FILE}
}

source_env

# 解析参数
while true ; do 
  # fetch first args,then use shift clear
  case "$1" in 
    -h|--help) show_help; shift ;exit 1;;
    # env-file
    -f|--force) FORCE_RMI=true ; shift ;;
    -l|--local) DEPLOY_LOCAL=true ; shift ;;
    -e|--env)
      case "$2" in 
        "") shift 2 ;;
        *) 
          echo $2
          if [[ "$2" =~ ^(.env)([\.a-zA-Z0-9_]+)?$ ]];then
            ENV_FILE=$2 ;
            source_env ;
          else 
            echo -e "\033[31mEnv file name illegal.\033[0m";
            exit 1;
          fi
         shift 2 ;;
      esac ;;      
    -m|--mount)
      case "$2" in
        "") shift 2 ;;
        *)
          if [[ "$2" =~ ^(/|\./)?([\.a-zA-Z0-9_-]+/?)+$ ]];then
            MNT_CONF_VOL=$2
          else
            echo -e "\033[31mMount path arg illegal. $2.\033[0m"
            exit 1;
          fi
          shift 2 ;;
      esac ;;
    -n|--name)
      case "$2" in
        "") shift 2 ;;
        *)
          if [[ "$2" =~ ^[a-zA-Z]+([a-zA-Z0-9_]+)+[a-zA-Z]+$ ]];then
            ASSIGN_CONTAINER_NAME=$2
          else
            echo -e "\033[31mContainer name arg illegal. $2.\033[0m"
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
          else
            echo -e "\033[31mVersion arg illegal. $2 shuld x.x.x \n\033[0m"
          fi
          shift 2;;
      esac ;;
    --) shift ; break ;;
    *) echo "Internal error."; exit ;;
  esac
done

# SET CURRENT_VERSION
if [[ "$DEPLOY_LOCAL" = true ]];then
  CUR_VERSION=$(cat "${workspace}/package.json" | grep version | head -1 | awk -F: '{ print $2 }' | sed 's/[",]//g')
  CUR_VERSION=`echo $CUR_VERSION | xargs`   
fi

if [[ "$ASSIGN_CONTAINER_NAME" != "" ]];then 
    CONTAINER_NAME=${REPO_NAMESPACE}/$ASSIGN_CONTAINER_NAME
    export CONTAINER_NAME=${CONTAINER_NAME}
fi

if [ "$1" != "" ];then
  if [[ "$1" =~ ^(pull|p|up|u|down|d|c|rmi|remove|stop|start|restart)$ ]];then
    EC_CMD=$1
  else
    echo -e "\033[31m请选择操作 pull[p],up[u],down[d],remove[rmi],start,stop or restart.\033[0m"
    exit 0;
  fi
else
  show_help;
  exit 0;
fi

# functions 
function check_network() {
  network=$(docker network ls |grep 'xy-network' | awk '{print $1}')
  if [ -z $network ] || [ "$network" == "" ];then 
    docker network create -d bridge xy-network
  fi
}

function export_env(){
  if [[ "$DEPLOY_LOCAL" = true ]];then 
    IMAGE_NAME=${REPO_NAMESPACE}/$REPO_IMG_NAME:$CUR_VERSION
  else
    IMAGE_NAME=$REPO_HOST/${REPO_NAMESPACE}/$REPO_IMG_NAME:$PUB_VERSION
  fi 
  
  export IMAGE_NAME=${IMAGE_NAME}
  export CONTAINER_NAME=${CONTAINER_NAME}
  export EXPOSE_PORT=${EXPOSE_PORT}
  export PORT=${PORT}

  if [[ "$MNT_CONF_VOL" =~ ^/([\.a-zA-Z0-9_-]+/?)+$ ]];then
    MNT_VOL=$MNT_CONF_VOL
  elif  [[ "$MNT_CONF_VOL" =~ ^./([\.a-zA-Z0-9_-]+/?)+$ ]];then
    MNT_VOL=${workspace}/${MNT_CONF_VOL:2}
  else 
    MNT_VOL=${workspace}/${MNT_CONF_VOL}
  fi
  
  if [[ "$MNT_DATA_VOL" =~ ^/([\.a-zA-Z0-9_-]+/?)+$ ]];then
    DATA_VOL=$MNT_DATA_VOL
  elif  [[ "$MNT_DATA_VOL" =~ ^./([\.a-zA-Z0-9_-]+/?)+$ ]];then
    DATA_VOL=${workspace}/${MNT_DATA_VOL:2}
  else 
    DATA_VOL=${workspace}/${MNT_DATA_VOL}
  fi

  if [[ ! -d "$DATA_VOL" ]];then 
    mkdir -p $DATA_VOL
  fi

  export MNT_VOL=${MNT_VOL}   
  export DATA_VOL=${DATA_VOL} 
}

function login_repo(){
  # login 
  docker login $REPO_HOST -u $REPO_NAME -p $REPO_PW
}

function up_container(){
  echo -e "\033[35mIMAGE_NAME=$IMAGE_NAME \nCONTAINER_NAME=$CONTAINER_NAME\nDATA_VOL=${DATA_VOL}  \033[0m"
  echo -e "\033[35mPORT=$PORT;EXPOSE_PORT=$EXPOSE_PORT\nMNT_VOL=$MNT_VOL\n\033[0m" 

  docker compose -f $workspace/${compose_file} up -d 
}

function down_container(){
  docker compose -f $workspace/${compose_file} down 
}

function start_container(){
  container_id=$(docker ps -aqf "name=$CONTAINER_NAME")

  if [[ ! -z $container_id  ]];then
    docker container start $CONTAINER_NAME
  else
    echo -e "\033[33mContainer $CONTAINER_NAME not deployed.\n\t\033[35mplease use app.sh <options> up container.\033[0m"
  fi
}

function stop_container(){
  container_id=$(docker ps -aqf "name=$CONTAINER_NAME")

  if [[ ! -z $container_id  ]];then
    docker container kill --signal="SIGKILL" $CONTAINER_NAME
  else
    echo -e "\033[35m$CONTAINER_NAME has been stopped.\033[0m"
  fi
}

function restart_container(){
  container_id=$(docker ps -aqf "name=$CONTAINER_NAME")

  if [[ ! -z $container_id  ]];then
    docker container restart $CONTAINER_NAME
  else
    docker container start $CONTAINER_NAME
  fi
}

function remove_image(){
  container_id=$(docker ps -aqf "name=$CONTAINER_NAME")
  if [[ ! -z $container_id ]];then
    docker container stop $CONTAINER_NAME
  fi

  if [[ "$FORCE_RMI" = true ]];then
    docker rmi $IMAGE_NAME
  else 
    docker rmi $IMAGE_NAME -f
  fi
}

function pull_image(){
  if [[ "$DEPLOY_LOCAL" = true ]];then
    echo -e "\033[31mPlease remove option -f.\033[0m"
    exit 1;
  fi
  IMG_PULL_URL=$IMAGE_NAME

  docker pull $IMG_PULL_URL
}

export_env
# EC_CMD
if [[ $EC_CMD =~ ^(up|u)$ ]];then
  login_repo
  check_network
  up_container
elif [[ $EC_CMD =~ ^(pull|p)$ ]];then
  login_repo  
  pull_image
elif [[ $EC_CMD =~ ^(down|d)$ ]];then
  down_container
elif [[ $EC_CMD =~ ^(rmi|remove)$ ]];then
  remove_image  
elif [[ "$EC_CMD" == "start" ]];then
  start_container
elif [[ "$EC_CMD" == "stop" ]];then
  stop_container
elif [[ "$EC_CMD" == "restart" ]];then
  restart_container  
else 
  show_help
  exit 0 
fi    