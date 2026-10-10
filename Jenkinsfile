
pipeline {
    agent any

    options {
        timestamps()
        disableConcurrentBuilds()
        timeout(time: 30, unit: 'MINUTES')
        skipDefaultCheckout(true)
    }

    environment {
        APP_NAME = 'dx-client-qa'
        APP_ENV = 'qa'
        APP_PORT = '7003'
        APP_DIR = '/var/www/projects/dx/dx-client-qa'
        ENV_FILE = '/var/www/projects/dx/dx-client-qa/.env.qa'
        DEPLOY_HELPER = '/usr/local/sbin/dx-deploy-client-qa'
    }

    stages {
        stage('Checkout') {
            steps {
                deleteDir()
                checkout scm
                sh 'git log -1 --oneline'
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Lint and Typecheck') {
            steps {
                sh '''
                    npm run lint
                    npm run typecheck
                '''
            }
        }

        stage('Build') {
            steps {
                sh '''
                    set -eu

                    test -f "$ENV_FILE"
                    cp "$ENV_FILE" .env.qa

                    APP_ENV=qa npm run build:qa

                    test -f .next/standalone/server.js
                    test -d .next/static

                    mkdir -p .next/standalone/.next
                    cp -a .next/static .next/standalone/.next/

                    if [ -d public ]; then
                        cp -a public .next/standalone/public
                    fi
                '''
            }
        }

        stage('Deploy') {
            steps {
                sh '''
                    set -eu
                    sudo -n "$DEPLOY_HELPER"
                '''
            }
        }

        stage('Health Check') {
            steps {
                sh '''
                    set -eu

                    for i in $(seq 1 15); do
                        if curl -fsS -o /dev/null \
                            "http://127.0.0.1:${APP_PORT}/"; then
                            echo "QA frontend health check passed."
                            exit 0
                        fi
                        sleep 2
                    done

                    echo "QA frontend health check failed."
                    exit 1
                '''
            }
        }
    }

    post {
        success {
            echo 'DX Client QA deployment completed successfully.'
        }
        failure {
            echo 'DX Client QA pipeline failed. Check the stage logs.'
        }
        always {
            echo 'DX Client QA pipeline finished.'
        }
    }
}
