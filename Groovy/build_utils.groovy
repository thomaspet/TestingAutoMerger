void sendEmail() {
    script {
        def mailRecipients = 'jirajenkins@unimicro.no' //Generic account, Culprits should be the ones failing the build
        def jobName = currentBuild.currentResult + " : " + env.JOB_NAME

        emailext body: '${SCRIPT, template="groovy-uni.template"}', //adapted HTML template
        mimeType: 'text/html',
        subject: "${jobName}",
        to: "${mailRecipients}",
        replyTo: "${mailRecipients}",
        recipientProviders: [
            [ $class: "DevelopersRecipientProvider" ],
            [ $class: "RequesterRecipientProvider" ],
            [ $class: "CulpritsRecipientProvider"]
        ]
    }
}

void publishByMsBuild(String webAppName, String rgName, String principalCredId, String publishProfile, String publishId, String whatToBuild, boolean swapStaging) {

  //Publish by MSBUILD 
  echo "Publish to app service with profile ${publishProfile}.."
  withCredentials([string(credentialsId: publishId, variable: 'PUBLISH_SECRET')]) {
    bat "\"${tool 'Studio2019'}\" ${whatToBuild} /p:DeployOnBuild=true /p:Configuration=Release /t:rebuild /t:clean /p:PublishProfile=\"${publishProfile}\" /p:Password=${PUBLISH_SECRET}"
  }
  script {
    if( swapStaging == true) { //Start, swap, stop the slot named "staging"
        echo "Start staging slot.."
        azureCLI commands: [[exportVariablesString: "", script: "az webapp start --name ${webAppName} --resource-group ${rgName} --slot staging"]], principalCredentialId: principalCredId

        echo "Swap staging into production.."
        azureCLI commands: [[exportVariablesString: "", script: "az webapp deployment slot swap --name ${webAppName} --resource-group ${rgName} --slot staging"]], principalCredentialId: principalCredId
        
        echo "Stop staging slot.."
        azureCLI commands: [[exportVariablesString: "", script: "az webapp stop --name ${webAppName} --resource-group ${rgName} --slot staging"]], principalCredentialId: principalCredId
    }
  }
}

return this;
