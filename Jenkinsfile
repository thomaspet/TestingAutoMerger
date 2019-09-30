def OUT_DIR_PUBLISH
def BUILD_UTILS
def BRANCH_NAME
def PUBLISH_NAME

pipeline {
  agent any
  options{timestamps()}
  stages {
    stage('Prepare') {
      steps {
        script {
          BUILD_UTILS = load "${pwd()}\\Groovy\\build_utils.groovy"
          OUT_FILE = "dist.zip"
          BRANCH_NAME = env.GIT_BRANCH
          if(BRANCH_NAME.toLowerCase().substring(0,7) == "origin/") {
            BRANCH_NAME = BRANCH_NAME.replace("origin/","")
          }
          switch(BRANCH_NAME) {
              case "deploytest":
                  PUBLISH_NAME = "prod-unieconomy"
                  break; 
              case "develop":
                  PUBLISH_NAME = "dev-unieconomy"
                  break; 
              case "test":
                  PUBLISH_NAME = "test-unieconomy"
                  break; 
              case "rc":
                  PUBLISH_NAME = "rc-unieconomy"
                  break; 
              case "ext01":
                  PUBLISH_NAME = "ext01-unieconomy.no"
                  break; 
              case "pilot":
                  PUBLISH_NAME = "pilot-unieconomy"
                  break; 
              case "master":
                  PUBLISH_NAME = "pilot-unieconomy"
                  break; 
              default:
                  error("Forcing pipeline failure, only specific named branches of the frontend are allowed to run as a pipeline!")
                  break; 
          }
          echo "Branch  name:" + BRANCH_NAME
          echo "Publish name:" + PUBLISH_NAME
        }
      }
    }
    stage('YarnInstall') {
      steps {
        bat """
          set PATH=%PATH%;%WORKSPACE%\\node_modules\\.bin
          set NODE_PATH=%WORKSPACE%\\node_modules
          yarn install
        """
      }
    }
    stage('YarnBuild') {
      steps {
        bat """
          set PATH=%PATH%;%WORKSPACE%\\node_modules\\.bin
          set NODE_PATH=%WORKSPACE%\\node_modules
          yarn build.prod
        """
      }
    }
    stage('ZipResult') {
      steps {
        bat """
          set PATH=%PATH%;%WORKSPACE%\\node_modules\\.bin
          set NODE_PATH=%WORKSPACE%\\node_modules
          yarn zip-dist
        """
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
                sourceFiles: 'dist.zip'
                ), 
                sshTransfer(
                execCommand: '''sudo unzip -o ~/dist.zip -d /var/www/html/''', 
                execTimeout: 120000, 
                ),
                sshTransfer(
                execCommand: '''sudo chmod -R 755 /var/www/html/*''', 
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
