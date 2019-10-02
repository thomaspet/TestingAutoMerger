def YARN_BUILD
def BUILD_UTILS
def BRANCH_NAME
def PUBLISH_NAME
def OUT_FILE
def ENV_PATH
def ENV_NODE

pipeline {
  agent any
  options{timestamps()}
  stages {
    stage('Prepare') {
      steps {
        script {
          //Load build-utils
          BUILD_UTILS = load "${pwd()}\\Groovy\\build_utils.groovy"

          //Ensure we only proccess branches that we want to actually deploy somewhere
          BRANCH_NAME = env.GIT_BRANCH
          if(BRANCH_NAME.toLowerCase().substring(0,7) == "origin/") {
            BRANCH_NAME = BRANCH_NAME.replace("origin/","")
          }
          switch(BRANCH_NAME) {
              case "deploytest":
                  PUBLISH_NAME = "prod-unieconomy"
                  YARN_BUILD = "build.prod"
                  break; 
              case "develop":
                  PUBLISH_NAME = "dev-unieconomy"
                  YARN_BUILD = "build.dev"
                  if(env.JOB_BASE_NAME.toLowerCase().reverse().substring(0,7) == "ylthgin") {
                    PUBLISH_NAME = "test-unieconomy"
                    YARN_BUILD = "build.test"
                  }
                  break; 
              case "test":
                  PUBLISH_NAME = "test-unieconomy"
                  YARN_BUILD = "build.test"
                  break; 
              case "rc":
                  PUBLISH_NAME = "rc-unieconomy"
                  YARN_BUILD = "build.rc"
                  break; 
              case "ext01":
                  PUBLISH_NAME = "ext01-unieconomy.no"
                  YARN_BUILD = "build.ext01"
                  break; 
              case "pilot":
                  PUBLISH_NAME = "pilot-unieconomy"
                  YARN_BUILD = "build.prod"
                  break; 
              case "master":
                  PUBLISH_NAME = "pilot-unieconomy"
                  YARN_BUILD = "build.prod"
                  break; 
              default:
                  error("Forcing pipeline failure, only specific named branches of the frontend are allowed to run as a pipeline!")
                  break; 
          }
          echo "Branch  name:" + BRANCH_NAME
          echo "Publish name:" + PUBLISH_NAME

          //Define variables for use later
          OUT_FILE = "dist.zip"
          ENV_PATH = "set PATH=%PATH%;%WORKSPACE%\\node_modules\\.bin"
          ENV_NODE = "set NODE_PATH=%WORKSPACE%\\node_modules"
        }
      }
    }
    stage('YarnInstall') {
      steps {
        withEnv(([ENV_PATH, ENV_NODE ])) {
          bat "yarn install" 
        }
      }
    }
    stage('YarnBuild') {
      steps {
        withEnv(([ENV_PATH, ENV_NODE ])) {
          bat "yarn ${YARN_BUILD}" 
        }
      }
    }
    stage('ZipResult') {
      steps {
        withEnv(([ENV_PATH, ENV_NODE ])) {
          bat "yarn zip-dist" 
        }
      }
    }
    stage('TransferAndUnzip') {
      steps {
        sshPublisher(
          publishers: [
            sshPublisherDesc(
            configName: PUBLISH_NAME, 
            transfers: [
                sshTransfer( 
                cleanRemote: false, 
                execTimeout: 120000, 
                sourceFiles: OUT_FILE
                ), 
                sshTransfer(
                execCommand: """sudo unzip -o ~/${OUT_FILE} -d /var/www/html/""", 
                execTimeout: 120000, 
                ),
                sshTransfer(
                execCommand: """sudo chmod -R 755 /var/www/html/*""", 
                execTimeout: 120000, 
                ) 
              ], 
            verbose: true
            )
          ]
        )
      }
    }
  }
  post { 
    always { 
      cleanWs()
    }
    fixed {
      office365ConnectorSend webhookUrl:env.TEAMS_NOTIFY_URL
    }
    failure {
      office365ConnectorSend webhookUrl:env.TEAMS_NOTIFY_URL
      script {
        BUILD_UTILS.sendEmail()
      }
    }
    unstable {
      office365ConnectorSend webhookUrl:env.TEAMS_NOTIFY_URL
    }
  }
}
