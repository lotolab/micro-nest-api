#!/bin/bash ENV_FILE
basepath=$(cd `dirname $0`;pwd);
workspace=$(cd `dirname $0`;cd ..;pwd);

CONF_BASE=.conf

REAL_CONF_BASE="${workspace}/${CONF_BASE}"

# ES
ALG=ES256
NAME=

# ES256-prime256v1,ES384- secp384r1,ES512 - secp521r1
CURVE=prime256v1
RS_LEN=2048

EC_CMD=ES256

# rebuild args
ARGS=$(getopt -o 'hc:n::' --long 'help,config:,name::' -n "$0" -- "$@")


# 将规范化后的命令行参数分配至位置参数（$1,$2,...)
eval set -- "${ARGS}"

# Command pull|up|down|remove|rmi|stop|start|restart
function show_help() {
  echo -e "\033[31mCommands Help :\n\033[0m";
  echo -e "\033[35m$ jwtkey.sh <options?> <command>\033[0m";
  echo -e "\033[34m jwtkey.sh options: \033[0m ";  
  echo -e "\033[33m\t-n<name> or --name=<name> : key pairs file name.\033[0m";
  echo -e "\033[33m\t-c<out file basedir> or --config=<out file basedir> : set out file base dir [default .conf].\033[0m";
  echo -e "\033[34m\nCommand:\033[0m";
  echo -e "\033[33m\t ES256 : generate key pairs with ECDSA using P-256 curve and SHA-256 hash algorithm.\033[0m";
  echo -e "\033[33m\t ES384 : generate key pairs with ECDSA using P-384 curve and SHA-384 hash algorithm.\033[0m";
  echo -e "\033[33m\t ES512 : generate key pairs with ECDSA using P-521 curve and SHA-512 hash algorithm.\033[0m";
}

# 解析参数
while true ; do 
  # fetch first args,then use shift clear
  case "$1" in 
    -h|--help) show_help; shift ;exit 1;;
    # env-file
    # -f|--force) FORCE_RMI=true ; shift ;;
    -n|--name)
      case "$2" in 
        "") shift 2 ;;
        *) 
          if [[ "$2" =~ ^([a-zA-Z]+)([\.a-zA-Z0-9_\-]+)?$ ]];then
            NAME=$2 ;
          else 
            echo -e "\033[31m name invalid, name required match ^([a-zA-Z]+)([\.a-zA-Z0-9_\-]+)?$ \033[0m";
            exit 1;
          fi
         shift 2 ;;
      esac ;;      
    -c|--config)
      case "$2" in
        "") shift 2 ;;
        *)
          if [[ "$2" =~ ^(/|\./)?([\.a-zA-Z0-9_-]+/?)+$ ]];then
            CONF_BASE=$2
          else
            echo -e "\033[31mMount path arg illegal. $2.\033[0m"
            exit 1;
          fi
          shift 2 ;;
      esac ;;
    --) shift ; break ;;
    *) echo "Internal error."; exit ;;
  esac
done

if [ "$1" != "" ];then
  if [[ "$1" =~ ^(ES256|ES384|ES512)$ ]];then
    EC_CMD=$1
  else
    echo -e "\033[31m请选择操作 ES256,ES384 or ES512 .\033[0m"
    exit 0;
  fi
else
  show_help;
  exit 0;
fi

LOWER_MODE_NAME=$(echo "${EC_CMD}" | tr '[:upper:]' '[:lower:]')
echo -e "LOWER_MODE_NAME ${LOWER_MODE_NAME}"

if [[ "$CONF_BASE" =~ ^/([\.a-zA-Z0-9_-]+/?)+$ ]];then 
    REAL_CONF_BASE=${CONF_BASE}
elif [[ "$CONF_BASE" =~ ^./([\.a-zA-Z0-9_-]+/?)+$ ]];then
    REAL_CONF_BASE=${workspace}/${CONF_BASE:2}
else 
    REAL_CONF_BASE=${workspace}/${CONF_BASE}
fi

function pre_check_dir(){
    if [[ ! -d "${REAL_CONF_BASE}/${LOWER_MODE_NAME}" ]];then
        mkdir -p "${REAL_CONF_BASE}/${LOWER_MODE_NAME}"
    fi
}

function gen_private_key() {
    priKeyFile="${REAL_CONF_BASE}/${LOWER_MODE_NAME}"

    if [[ "$NAME" = "" ]];then
        priKeyFile="${REAL_CONF_BASE}/${LOWER_MODE_NAME}/private.ec.key"
    else 
        priKeyFile="${REAL_CONF_BASE}/${LOWER_MODE_NAME}/private.${NAME}.key"
    fi

    if [[ -f "${priKeyFile}" ]];then
        echo -e "\033[31m Private key file had exists [${priKeyFile}] \033[0m";
        exit 1
    fi

    openssl ecparam -name "${CURVE}" -genkey -noout -out $priKeyFile
    echo -e "\033[32m Private key has generated.\n\t\033[35m ${priKeyFile}.\033[0m"
}

function gen_public_key(){

    priKeyFile=""
    if [[ "$NAME" = "" ]];then
        priKeyFile="${REAL_CONF_BASE}/${LOWER_MODE_NAME}/private.ec.key"
    else 
        priKeyFile="${REAL_CONF_BASE}/${LOWER_MODE_NAME}/private.${NAME}.key"
    fi
    if [[ ! -f "${priKeyFile}" ]];then
        echo -e "\033[31m Private key file unfound [${priKeyFile}] \033[0m";
        exit 1
    fi

    pubKeyFile=""
    if [[ "$NAME" = "" ]];then
        pubKeyFile="${REAL_CONF_BASE}/${LOWER_MODE_NAME}/pub.ec.pem"
    else 
        pubKeyFile="${REAL_CONF_BASE}/${LOWER_MODE_NAME}/public.${NAME}.pem"
    fi 

    if [[ -f "${pubKeyFile}" ]];then
        echo -e "\033[31m Public file had exists [${pubKeyFile}] \033[0m";
        exit 1
    fi   

    openssl ec -in ${priKeyFile} -pubout -out ${pubKeyFile}
    echo -e "\033[32m Public key has generated.\n\t\033[35m ${pubKeyFile}.\033[0m"

}


# EC_CMD
if [[ $EC_CMD =~ ^(ES256|es256)$ ]];then 
    CURVE=prime256v1
    pre_check_dir
    gen_private_key
    gen_public_key
    
elif [[ $EC_CMD =~ ^(ES384|es384)$ ]];then
    CURVE=secp384r1 
    pre_check_dir
    gen_private_key
    gen_public_key

elif [[ $EC_CMD =~ ^(ES512|es512)$ ]];then 
    CURVE=secp521r1
    pre_check_dir
    gen_private_key
    gen_public_key
    
# elif [[ $EC_CMD =~ ^(up|u)$ ]];then 
else 
  show_help
  exit 0
fi