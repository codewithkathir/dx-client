pipeline {
    agent any

    environment {
        APP_DIR = "/var/www/projects/dx/dx_client"
        BRANCH = "main"
        REPO = "https://github.com/codewithkathir/dx-client.git"
    }

    stages {

        stage('Checkout') {
            steps {
                script {
                    if (fileExists('.git')) {
                        sh 'git reset --hard'
                        sh 'git clean -fd'
                    }
                }

                git branch: "${BRANCH}",
                    url: "${REPO}"
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint || true'
            }
        }

        stage('Type Check') {
            steps {
                sh 'npm run typecheck'
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Deploy') {
            steps {
                sh """
                    sudo mkdir -p ${APP_DIR}

                    rsync -av --delete \
                    --exclude=node_modules \
                    --exclude=.git \
                    ./ ${APP_DIR}/

                    cd ${APP_DIR}
                    npm install --production
                """
            }
        }

        stage('Restart Application') {
            steps {
                sh """
                    pm2 delete dx-client || true

                    cd ${APP_DIR}

                    pm2 start npm \
                    --name dx-client \
                    -- start

                    pm2 save
                """
            }
        }

        stage('Verify') {
            steps {
                sh 'pm2 status'
            }
        }
    }

    post {
        success {
            echo '✅ DX Client deployed successfully'
        }

        failure {
            echo '❌ Deployment failed'
        }
    }
}